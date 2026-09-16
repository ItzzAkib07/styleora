import hashlib
import hmac
import uuid
from typing import Any, Dict, Optional
import httpx
from app.config.settings import settings
from app.core.logging import logger
from app.exceptions.handlers import StyleoraException


class RazorpayClient:
    """
    Secure client for Razorpay Standard Web Checkout in TEST MODE.
    Provides server-side order creation, payment retrieval, and cryptographic signature verification.
    """

    BASE_URL = "https://api.razorpay.com/v1"

    def __init__(
        self,
        key_id: Optional[str] = None,
        key_secret: Optional[str] = None,
        webhook_secret: Optional[str] = None,
    ):
        self.key_id = key_id or settings.RAZORPAY_KEY_ID
        self.key_secret = key_secret or settings.RAZORPAY_KEY_SECRET
        self.webhook_secret = webhook_secret or settings.RAZORPAY_WEBHOOK_SECRET

    async def create_order(
        self,
        amount: int,
        currency: str = "INR",
        receipt: Optional[str] = None,
        notes: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Creates a Razorpay Order via server-side Basic Auth.
        Amount must be provided in lowest currency denomination (paise).
        """
        if (
            not self.key_id
            or not self.key_secret
            or self.key_id.startswith("rzp_test_mock_")
            or settings.ENVIRONMENT == "test"
        ):
            # If running in local test mode or with mock credentials, generate deterministic mock order
            order_id = f"order_{uuid.uuid4().hex[:14]}"
            logger.info("Generating local test-mode mock Razorpay order", extra={"extra_data": {"order_id": order_id}})
            return {
                "id": order_id,
                "entity": "order",
                "amount": amount,
                "amount_paid": 0,
                "amount_due": amount,
                "currency": currency,
                "receipt": receipt,
                "status": "created",
                "attempts": 0,
                "notes": notes or {},
                "created_at": 1700000000,
            }

        payload: Dict[str, Any] = {
            "amount": amount,
            "currency": currency,
        }
        if receipt:
            payload["receipt"] = receipt[:40]
        if notes:
            payload["notes"] = notes

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.BASE_URL}/orders",
                    json=payload,
                    auth=(self.key_id, self.key_secret),
                )
        except (httpx.RequestError, httpx.TimeoutException) as exc:
            logger.error(f"Razorpay order creation connection failed: {str(exc)}", exc_info=True)
            raise StyleoraException(
                message="Unable to communicate with the payment gateway. Please try again shortly.",
                code="PAYMENT_GATEWAY_UNAVAILABLE",
                status_code=503,
            )

        if res.status_code != 200:
            logger.error(
                f"Razorpay order creation failed with status {res.status_code}: {res.text}",
                extra={"extra_data": {"status_code": res.status_code}},
            )
            raise StyleoraException(
                message="Failed to initialize payment order with payment gateway.",
                code="PAYMENT_ORDER_CREATION_FAILED",
                status_code=502,
            )

        return res.json()

    async def fetch_payment(self, payment_id: str) -> Dict[str, Any]:
        """Fetches payment details directly from Razorpay for authoritative reconciliation."""
        if (
            not self.key_id
            or not self.key_secret
            or self.key_id.startswith("rzp_test_mock_")
            or settings.ENVIRONMENT == "test"
        ):
            return {
                "id": payment_id,
                "entity": "payment",
                "amount": 279900,
                "currency": "INR",
                "status": "captured",
                "method": "upi",
            }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    f"{self.BASE_URL}/payments/{payment_id}",
                    auth=(self.key_id, self.key_secret),
                )
        except (httpx.RequestError, httpx.TimeoutException) as exc:
            logger.error(f"Razorpay fetch payment connection failed: {str(exc)}", exc_info=True)
            raise StyleoraException(
                message="Unable to verify payment status with payment gateway.",
                code="PAYMENT_GATEWAY_UNAVAILABLE",
                status_code=503,
            )

        if res.status_code != 200:
            logger.error(f"Razorpay fetch payment failed ({res.status_code}): {res.text}")
            raise StyleoraException(
                message="Could not retrieve payment confirmation from gateway.",
                code="PAYMENT_FETCH_FAILED",
                status_code=502,
            )

        return res.json()

    def verify_payment_signature(
        self,
        order_id: str,
        payment_id: str,
        signature: str,
    ) -> bool:
        """
        Validates HMAC-SHA256 signature returned by Razorpay Standard Checkout:
        HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
        Uses constant-time comparison to prevent timing attacks.
        """
        if not self.key_secret:
            logger.error("Cannot verify payment signature: RAZORPAY_KEY_SECRET is not configured.")
            return False

        message = f"{order_id}|{payment_id}"
        expected_sig = hmac.new(
            self.key_secret.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected_sig, signature)

    def verify_webhook_signature(
        self,
        raw_body: bytes,
        signature: str,
    ) -> bool:
        """
        Validates HMAC-SHA256 signature on raw webhook request bytes:
        HMAC-SHA256(raw_body, WEBHOOK_SECRET)
        Uses constant-time comparison.
        """
        if not self.webhook_secret:
            logger.error("Cannot verify webhook signature: RAZORPAY_WEBHOOK_SECRET is not configured.")
            return False

        expected_sig = hmac.new(
            self.webhook_secret.encode("utf-8"),
            raw_body,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected_sig, signature)


# Authoritative singleton client
razorpay_client = RazorpayClient()
