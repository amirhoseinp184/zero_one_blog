from rest_framework.exceptions import APIException
from rest_framework import status



class UnprocessableEntity(APIException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_code = "unprocessable_entity"
    default_detail = {'message': 'Unable to process the request.'}


class ConflictError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_code = 'conflict'
    default_detail = {'message': 'There is a conflict in processing the request.'}


class RateLimited(APIException):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_code = "too_many_request"
    default_detail = {"message": "Too many request, try later time."}
    

class NotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_code = 'not_found'
    default_detail = 'The requested resource not found.'