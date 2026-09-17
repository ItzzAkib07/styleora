import { apiClient } from '@/api/client';

export const paymentService = {
  /**
   * Requests a secure Razorpay checkout order for an active consultation.
   * Backend strictly resolves the order amount from the frozen quote in the atelier ledger.
   */
  async createPaymentOrder(consultationCode) {
    return apiClient('/payments/orders', {
      method: 'POST',
      body: JSON.stringify({
        consultation_code: consultationCode.trim().toUpperCase(),
      }),
    });
  },

  /**
   * Sends Razorpay checkout credentials to the backend for server-side cryptographic
   * signature verification and reconciliation.
   */
  async verifyPayment(verificationPayload) {
    return apiClient('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(verificationPayload),
    });
  },

  /**
   * Reports checkout failure from Razorpay Standard Checkout to the backend
   * to record telemetry and transition consultation to PAYMENT_FAILED.
   */
  async reportPaymentFailure(failurePayload) {
    return apiClient('/payments/fail', {
      method: 'POST',
      body: JSON.stringify(failurePayload),
    });
  },
};

