from django.contrib.auth import get_user_model
from accounts import models

User = get_user_model()


def create_user(**extra_fields):
    if (not extra_fields.get("email")) and (not extra_fields.get("phone")):
        raise ValueError(
            "User should have at least an email address or a phone number."
        )

    user = User.objects.create_user(**extra_fields)
    return user


def _create_otp(identifier, channel ,intent):
    OtpModel = None
    if intent == "login":
        if channel == "email":
            OtpModel = models.LoginEmailOtp
        elif channel == "phone":
            OtpModel = models.LoginPhoneOtp
    elif intent == "register":
        if channel == "email":
            OtpModel = models.RegisterEmailOtp
        elif channel == "phone":
            OtpModel = models.RegisterPhoneOtp

    if not OtpModel:
        raise ValueError("No valid otp found.")

    otp, _ = OtpModel.objects.get_or_create(**{channel: identifier})
    if not otp.is_still_valid():
        otp.generate_code()
        otp.send_code()

    return otp.code


def create_login_otp(identifier, channel):
    return _create_otp(identifier, channel, intent='login')


def create_register_otp(identifier, channel):
    return _create_otp(identifier, channel, intent='register')
