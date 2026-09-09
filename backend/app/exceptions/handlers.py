from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.logging import logger, request_id_ctx
from app.schemas.response import APIErrorDetails, APIResponse


class StyleoraException(Exception):
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR, details: any = None):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class NotFoundException(StyleoraException):
    def __init__(self, message: str = "Resource not found", code: str = "RESOURCE_NOT_FOUND"):
        super().__init__(message=message, code=code, status_code=status.HTTP_404_NOT_FOUND)


class ValidationException(StyleoraException):
    def __init__(self, message: str = "Validation failed", details: any = None):
        super().__init__(message=message, code="VALIDATION_ERROR", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, details=details)


class DuplicateException(StyleoraException):
    def __init__(self, message: str = "Duplicate resource", code: str = "RESOURCE_CONFLICT"):
        super().__init__(message=message, code=code, status_code=status.HTTP_409_CONFLICT)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StyleoraException)
    async def styleora_exception_handler(request: Request, exc: StyleoraException):
        req_id = request_id_ctx.get()
        return JSONResponse(
            status_code=exc.status_code,
            content=APIResponse(
                success=False,
                error=APIErrorDetails(
                    code=exc.code,
                    message=exc.message,
                    reference_id=req_id,
                    details=exc.details,
                ),
            ).model_dump(exclude_none=True),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        req_id = request_id_ctx.get()
        errors = []
        for err in exc.errors():
            loc = " -> ".join(str(l) for l in err.get("loc", []))
            errors.append({"field": loc, "message": err.get("msg")})

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=APIResponse(
                success=False,
                error=APIErrorDetails(
                    code="VALIDATION_ERROR",
                    message="The submitted data contains validation errors.",
                    reference_id=req_id,
                    details=errors,
                ),
            ).model_dump(exclude_none=True),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        req_id = request_id_ctx.get()
        return JSONResponse(
            status_code=exc.status_code,
            content=APIResponse(
                success=False,
                error=APIErrorDetails(
                    code=f"HTTP_{exc.status_code}",
                    message=exc.detail if isinstance(exc.detail, str) else "Request error",
                    reference_id=req_id,
                ),
            ).model_dump(exclude_none=True),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        req_id = request_id_ctx.get()
        logger.error(f"Unhandled server error [Ref: {req_id}]: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=APIResponse(
                success=False,
                error=APIErrorDetails(
                    code="INTERNAL_SERVER_ERROR",
                    message="An unexpected error occurred. Please contact support with the reference ID.",
                    reference_id=req_id,
                ),
            ).model_dump(exclude_none=True),
        )
