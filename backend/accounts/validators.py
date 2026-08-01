from phonenumber_field.phonenumber import to_python
from django.conf import settings
from rest_framework.serializers import ValidationError


def validate_phone(value, message=None, code="invalid"):
    try:
        phone = to_python(value, region=getattr(settings, "PHONENUMBER_DEFAULT_REGION"))
        if not phone.is_valid():
            raise ValidationError(message or "شماره تلفن نامعتبر است.", code=code)
    except:
        raise ValidationError(message or "شماره تلفن نامعتبر است.", code=code)

    return phone


def validate_username(username: str, message=None, code=None):
    if username and username[0].isdigit():
        raise ValidationError("نام کاربری نمیتواند با عدد شروع شود.", code=code or None)
    if "@" in username or " " in username or "/" in username:
        raise ValidationError(
            message
            or "نام کاربری فقط میتواند شامل حروف لاتین, آندرلاین, نقطفه و خط فاصله باشد.",
            code=code or "invalid",
        )

    return username


def mask_email(email):
    username, domain = email.split("@")
    username = list(username)
    return (
        "".join([username[0], "*" * (len(username) - 2), username[-1]]) + "@" + domain
    )


def mask_phone(phone):
    phone = phone.as_national.replace(" ", "")
    phone = list(phone)
    return "".join([*phone[0:4], "*****", *phone[-2:]])
