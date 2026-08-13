from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.generics import GenericAPIView
from rest_framework import mixins
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import Throttled, AuthenticationFailed
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth import get_user_model, logout
from django.db.models import Q

from . import serializers
from accounts import models
from common.exceptions import ConflictError, NotFoundException, UnprocessableEntity
from accounts.validators import mask_email, mask_phone
from utils.formatters import format_phone


User = get_user_model()


def _check_duplicate(identifier, identifier_type):
    is_duplicate = User.objects.filter(
        Q(email=identifier) | Q(phone=identifier)
    ).exists()
    if is_duplicate:
        if identifier_type == "email":
            raise ConflictError(detail="آدرس ایمیل تکراری است.", code="duplicate_email")
        else:
            raise ConflictError(detail="شماره تلفن تکراری است.", code="duplicate_phone")


def _get_otp_for_identifier(identifier, channel, intent):
    print(identifier, channel, intent)
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
    return otp


def _send_code_for_otp(otp):
    try:
        if not otp.is_still_valid():
            otp.generate_code()
            otp.send_code()
        return otp.ttl
    except models.RateLimitExceeded:
        raise Throttled(
            detail="تعداد درخواست بیش از حد مجاز, مدتی دیگر امتحان کنید.",
            code="too_many_request",
        )


class CheckUserView(GenericAPIView):
    serializer_class = serializers.CheckUserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.data.get("identifier")
        identifier_type = serializer.data.get("identifier_type")
        intent = serializer.data.get("intent")

        if intent == "login":
            user = User.objects.filter(
                Q(username=identifier) | Q(email=identifier) | Q(phone=identifier)
            )
            if not user.exists():
                raise NotFoundException(
                    detail="کاربری با این مشخصات یافت نشد.", code="user_not_found"
                )

            user = user.get()

            email = None
            if user.email:
                email = (
                    user.email if identifier_type == "email" else mask_email(user.email)
                )

            phone = None
            if user.phone:
                phone = (
                    format_phone(user.phone)
                    if identifier_type == "phone"
                    else mask_phone(user.phone)
                )

            return Response(
                {
                    "exists": True,
                    "identifier_type": identifier_type,
                    "verify_options": {
                        "email": email,
                        "phone": phone,
                        "password": user.has_usable_password(),
                    },
                }
            )

        else:
            if identifier_type == "username":
                raise ConflictError(
                    detail="از ایمیل یا شماره تلفن برای ثبت نام استفاده کنید.",
                    code="username_not_allowed",
                )

            _check_duplicate(identifier, identifier_type)

            return Response({"exists": False, "identifier_type": identifier_type})


class SendOtpView(GenericAPIView):
    serializer_class = serializers.SendOtpSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.data.get("identifier")
        identifier_type = serializer.data.get("identifier_type")
        channel = serializer.data.get("channel")
        intent = serializer.data.get("intent")

        if intent == "login":
            user = User.objects.filter(
                Q(username=identifier) | Q(email=identifier) | Q(phone=identifier)
            )
            if not user.exists():
                raise NotFoundException(
                    detail="کاربری با این مشخصات یافت نشد.", code="user_not_found"
                )
            user = user.first()

            if identifier_type == "username" or channel:
                if channel == "email" and not getattr(user, "email", None):
                    raise UnprocessableEntity(
                        detail="آدرس ایمیلی مرتبط با حساب کاربری یافت نشد.",
                        code="channel_unavailable",
                    )

                if channel == "phone" and not getattr(user, "phone", None):
                    raise UnprocessableEntity(
                        detail="شماره تلفنی مرتبط با حساب کاربری یافت نشد.",
                        code="channel_unavailable",
                    )

                identifier = getattr(user, channel)

            otp = _get_otp_for_identifier(
                identifier, channel=channel or identifier_type, intent="login"
            )
            ttl = _send_code_for_otp(otp)

            return Response({"ttl": ttl})

        else:
            if identifier_type == "username":
                raise ConflictError(
                    detail="از ایمیل یا شماره تلفن برای ثبت نام استفاده کنید.",
                    code="username_not_allowed",
                )

            _check_duplicate(identifier, identifier_type)

            otp = _get_otp_for_identifier(
                identifier, channel=identifier_type, intent="register"
            )
            ttl = _send_code_for_otp(otp)

            return Response({"ttl": ttl})


class VerifyOtpView(GenericAPIView):
    serializer_class = serializers.VerifyOtpSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.data.get("identifier")
        identifier_type = serializer.data.get("identifier_type")
        intent = serializer.data.get("intent")
        channel = serializer.data.get("channel")
        code = serializer.data.get("code")

        if intent == "login":
            user = User.objects.filter(
                Q(username=identifier) | Q(email=identifier) | Q(phone=identifier)
            )
            if not user.exists():
                raise UnprocessableEntity(
                    detail="کد وارد شده نامعتبر یا منقضی شده است.",
                    code="invalid_or_expired",
                )
            user = user.first()

            try:
                otp = _get_otp_for_identifier(
                    (
                        identifier
                        if identifier_type != "username" and not channel
                        else getattr(user, channel)
                    ),
                    channel=(channel or identifier_type),
                    intent="login",
                )
            except:
                raise UnprocessableEntity(
                    detail="کد وارد شده نامعتبر یا منقضی شده است.",
                    code="invalid_or_expired",
                )

            try:
                is_verified = otp.verify(code)
            except models.MaxThrottleAttemptExceed:
                raise Throttled(
                    detail="تعداد درخواست بیش از حد مجاز, مدتی دیگر امتحان کنید.",
                    code="too_many_request",
                )

            if not is_verified:
                raise UnprocessableEntity(
                    detail="کد وارد شده نامعتبر یا منقضی شده است.",
                    code="invalid_or_expired",
                )

            refresh = RefreshToken.for_user(user)
            request.session["refresh_token"] = str(refresh)
            request.session.save()

            return Response({"token": str(refresh.access_token)})

        else:
            if identifier_type == "username":
                raise ConflictError(
                    detail="از ایمیل یا شماره تلفن برای ثبت نام استفاده کنید.",
                    code="username_not_allowed",
                )

            try:
                otp = _get_otp_for_identifier(
                    identifier, channel=identifier_type, intent="register"
                )
            except:
                raise UnprocessableEntity(
                    detail="کد وارد شده نامعتبر یا منقضی شده است.",
                    code="invalid_or_expired",
                )

            try:
                is_verified = otp.verify(code)
            except models.MaxThrottleAttemptExceed:
                raise Throttled(
                    detail="تعداد درخواست بیش از حد مجاز, مدتی دیگر امتحان کنید.",
                    code="too_many_request",
                )
            if not is_verified:
                raise UnprocessableEntity(
                    detail="کد وارد شده نامعتبر یا منقضی شده است.",
                    code="invalid_or_expired",
                )

            user = User.objects.create_user(**{identifier_type: identifier})
            refresh = RefreshToken.for_user(user)
            request.session["refresh_token"] = str(refresh)
            request.session.save()

            return Response({"token": str(refresh.access_token)})


class PasswordLoginView(GenericAPIView):
    serializer_class = serializers.PasswordLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.data.get("identifier")
        password = serializer.data.get("password")

        user = User.objects.filter(
            Q(username=identifier) | Q(email=identifier) | Q(phone=identifier)
        )

        if not user.exists() or not user[0].check_password(password):
            raise UnprocessableEntity(
                detail="رمز عبور اشتباه است.",
                code="incorrect_information",
            )

        refresh = RefreshToken.for_user(user[0])
        self.request.session["refresh_token"] = str(refresh)
        self.request.session.save()

        return Response({"token": str(refresh.access_token)})


class RefreshView(GenericAPIView):

    def post(self, request, *args, **kwargs):
        refresh_token = request.session.get("refresh_token")

        if not refresh_token:
            raise AuthenticationFailed(
                detail="No valid token found.", code="invalid_or_expired_token"
            )

        try:
            return Response({"token": str(RefreshToken(refresh_token).access_token)})
        except:
            raise AuthenticationFailed(
                detail="No valid token found.", code="invalid_or_expired_token"
            )


class LogoutView(GenericAPIView):

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class SettingsView(mixins.UpdateModelMixin, mixins.RetrieveModelMixin, GenericAPIView):
    serializer_class = serializers.SettingsSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return self.retrieve(request)

    def post(self, request, *args, **kwargs):
        return self.partial_update(request)

    def get_object(self):
        return self.request.user


class PublicProfileView(generics.RetrieveAPIView, GenericAPIView):
    serializer_class = serializers.PublicProfileSerializer
    queryset = User.objects.all()
    lookup_field = 'username'
