from drf_standardized_errors.formatter import ExceptionFormatter
from drf_standardized_errors.handler import ExceptionHandler
from drf_standardized_errors.types import (
    ErrorType,
    ErrorResponse,
    Error as ValidationError,
)
from dataclasses import dataclass
from typing import Optional, List


@dataclass
class CustomValidationError:
    code: str
    message: str
    field_name: str


@dataclass
class CustomError:
    code: str
    message: str


class CustomExceptionFormatter(ExceptionFormatter):
    def format_error_response(self, error_response):
        response = super().format_error_response(error_response)

        if error_response.type == 'validation_error':
            return response
        
        error = error_response.errors[0]
        return {
            "type": error_response.type,
            "code": error.code,
            "message": error.message
        }
        

    def get_error_response(self, error_type, errors):
        custom_errors = []
        if error_type == "validation_error":
            # return super().get_error_response(error_type, errors)
            for error in errors:
                custom_errors.append(
                    CustomValidationError(
                        code=error.code, message=error.detail, field_name=error.attr
                    )
                )
        else:
            for error in errors:
                custom_errors.append(CustomError(code=error.code, message=error.detail))

        return ErrorResponse(type=error_type, errors=custom_errors)
