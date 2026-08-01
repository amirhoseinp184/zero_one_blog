from unittest import SkipTest
from freezegun import freeze_time
from datetime import timedelta
from tempfile import NamedTemporaryFile
from PIL import Image

from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.test import APITestCase
from rest_framework import status

from django.urls import reverse
from django.core import mail
from django.test import override_settings
from django.contrib.auth import get_user_model

from utils.test import create_user, create_login_otp, create_register_otp


CHECK_USER_URL = reverse("accounts-api:check-user")
SEND_OTP_URL = reverse("accounts-api:send-otp")
VERIFY_OTP_URL = reverse("accounts-api:verify-otp")
PASSWORD_LOGIN_URL = reverse("accounts-api:password-login")
REFRESH_URL = reverse("accounts-api:refresh")
LOGOUT_URL = reverse("accounts-api:logout")
SETTINGS_URL = reverse("accounts-api:settings")


User = get_user_model()


class CheckUserTests(APITestCase):

    def setUp(self):
        self.email = "test@example.com"
        self.phone = "09101234567"
        self.username = "test_username"

    def test_register_new_email(self):
        payload = {"identifier": self.email, "intent": "register"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["exists"], False)
        self.assertEqual(res.data["identifier_type"], "email")

    def test_register_new_phone(self):
        payload = {"identifier": self.phone, "intent": "register"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["exists"], False)
        self.assertEqual(res.data["identifier_type"], "phone")

    def test_register_username_not_allowed(self):
        payload = {"identifier": self.username, "intent": "register"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(res.data["code"], "username_not_allowed")
        self.assertEqual(
            res.data["message"], "از ایمیل یا شماره تلفن برای ثبت نام استفاده کنید."
        )

    def test_register_duplicate_email(self):
        create_user(email=self.email)
        payload = {"identifier": self.email, "intent": "register"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(res.data["code"], "duplicate_email")
        self.assertEqual(res.data["message"], "آدرس ایمیل تکراری است.")

    def test_register_duplicate_phone(self):
        create_user(phone=self.phone)
        payload = {"identifier": self.phone, "intent": "register"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(res.data["code"], "duplicate_phone")
        self.assertEqual(res.data["message"], "شماره تلفن تکراری است.")

    def test_login_existent_email(self):
        create_user(email=self.email)
        payload = {"identifier": self.email, "intent": "login"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["exists"], True)
        self.assertEqual(res.data["identifier_type"], "email")

        self.assertEqual(
            res.data["verify_options"],
            {
                "email": self.email,
                "phone": None,
                "password": False,
            },
        )

    def test_login_existent_phone(self):
        create_user(phone=self.phone, email="")
        payload = {"identifier": self.phone, "intent": "login"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["exists"], True)
        self.assertEqual(res.data["identifier_type"], "phone")

        self.assertEqual(
            res.data["verify_options"],
            {
                "email": None,
                "phone": self.phone,
                "password": False,
            },
        )

    def test_login_existent_username(self):
        create_user(phone=self.phone, email=self.email, username=self.username)
        payload = {"identifier": self.username, "intent": "login"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["exists"], True)
        self.assertEqual(res.data["identifier_type"], "username")

        self.assertEqual(
            res.data["verify_options"],
            {
                "email": "t**t@example.com",
                "phone": "0910*****67",
                "password": False,
            },
        )

    def test_login_with_non_existent_identifier(self):
        cases = {"email": self.email, "phone": self.phone, "username": self.username}
        for identifier_type, identifier in cases.items():
            payload = {"identifier": identifier, "intent": "login"}
            res = self.client.post(CHECK_USER_URL, payload)
            self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
            self.assertEqual(res.data["code"], "user_not_found")
            self.assertEqual(res.data["message"], "کاربری با این مشخصات یافت نشد.")

    def test_verify_options_when_user_have_password(self):
        create_user(email=self.email, password="testpass")
        payload = {"identifier": self.email, "intent": "login"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(
            res.data["verify_options"],
            {"email": self.email, "phone": None, "password": True},
        )

    def test_invalid_email(self):
        payload = {"identifier": "test@.com", "intent": "login"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data["errors"][0]["code"], "invalid_identifier")
        self.assertEqual(res.data["errors"][0]["message"], "ایمیل نامعتبر است.")

    def test_invalid_phone(self):
        payload = {"identifier": "0910123", "intent": "login"}
        res = self.client.post(CHECK_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data["errors"][0]["code"], "invalid_identifier")
        self.assertEqual(res.data["errors"][0]["message"], "شماره تلفن نامعتبر است.")


@override_settings(OTP_DURATION=120)
class SendOtpTests(APITestCase):

    def setUp(self):
        self.email = "test@example.com"
        self.phone = "09101234567"
        self.username = "test_username"

    def test_register_new_email(self):
        payload = {"identifier": self.email, "intent": "register"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["ttl"], 120)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].recipients(), [self.email])

    def test_register_new_phone(self):
        payload = {"identifier": self.email, "intent": "register"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["ttl"], 120)
        # TODO implement sending otp to phone number functionality and asserting that.

    def test_register_username_not_allowed(self):
        payload = {"identifier": self.username, "intent": "register"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(res.data["code"], "username_not_allowed")
        self.assertEqual(
            res.data["message"], "از ایمیل یا شماره تلفن برای ثبت نام استفاده کنید."
        )

    def test_register_duplicate_email(self):
        create_user(email=self.email)
        payload = {"identifier": self.email, "intent": "register"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(res.data["code"], "duplicate_email")
        self.assertEqual(res.data["message"], "آدرس ایمیل تکراری است.")

    def test_register_duplicate_phone(self):
        create_user(phone=self.phone)
        payload = {"identifier": self.phone, "intent": "register"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(res.data["code"], "duplicate_phone")
        self.assertEqual(res.data["message"], "شماره تلفن تکراری است.")

    def test_login_existent_email(self):
        create_user(email=self.email)
        payload = {"identifier": self.email, "intent": "login"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["ttl"], 120)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].recipients(), [self.email])

    def test_login_existent_phone(self):
        create_user(phone=self.phone)
        payload = {"identifier": self.phone, "intent": "login"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["ttl"], 120)
        # TODO implement sending otp to phone number functionality and asserting that.

    def test_login_phone_channel_with_email_identifier(self):
        create_user(email=self.email, phone=self.phone)
        payload = {"identifier": self.email, "intent": "login", "channel": "phone"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["ttl"], 120)
        self.assertEqual(len(mail.outbox), 0)
        # TODO implement sending otp to phone number functionality and asserting that.

    def test_login_email_channel_with_phone_identifier(self):
        create_user(email=self.email, phone=self.phone)
        payload = {"identifier": self.phone, "intent": "login", "channel": "email"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # TODO assert no opt haven't been sent to user phone
        self.assertEqual(res.data["ttl"], 120)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].recipients(), [self.email])

    def test_login_email_channel_with_non_existent_email(self):
        create_user(phone=self.phone, email="")
        payload = {"identifier": self.phone, "intent": "login", "channel": "email"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(res.data["code"], "channel_unavailable")
        self.assertEqual(
            res.data["message"], "آدرس ایمیلی مرتبط با حساب کاربری یافت نشد."
        )

    def test_login_phone_channel_with_non_existent_phone(self):
        create_user(email=self.email, phone="")
        payload = {"identifier": self.email, "intent": "login", "channel": "phone"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(res.data["code"], "channel_unavailable")
        self.assertEqual(
            res.data["message"], "شماره تلفنی مرتبط با حساب کاربری یافت نشد."
        )

    def test_login_username_identifier_without_channel_results_error(self):
        create_user(username=self.username, email=self.email)
        payload = {"identifier": self.username, "intent": "login"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data["errors"][0]["field_name"], "channel")
        self.assertEqual(
            res.data["errors"][0]["message"], "برای ورود با نام کاربری چنل الزامی است."
        )

    def test_login_email_channel_with_username_identifier(self):
        create_user(email=self.email, username=self.username)
        payload = {"identifier": self.username, "intent": "login", "channel": "email"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].recipients(), [self.email])

    def test_login_phone_channel_with_username_identifier(self):
        create_user(phone=self.phone, username=self.username)
        payload = {"identifier": self.username, "intent": "login", "channel": "phone"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["ttl"], 120)
        # TODO implement phone otp functionality and assert that.

    def test_login_phone_channel_with_username_identifier_with_non_existent_phone(self):
        create_user(email=self.email, username=self.username)
        payload = {"identifier": self.username, "intent": "login", "channel": "phone"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(res.data["code"], "channel_unavailable")
        self.assertEqual(
            res.data["message"], "شماره تلفنی مرتبط با حساب کاربری یافت نشد."
        )

    def test_login_email_channel_with_username_identifier_with_non_existent_email(self):
        create_user(phone=self.phone, username=self.username)
        payload = {"identifier": self.username, "intent": "login", "channel": "email"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(res.data["code"], "channel_unavailable")
        self.assertEqual(
            res.data["message"], "آدرس ایمیلی مرتبط با حساب کاربری یافت نشد."
        )

    def test_repeated_request_during_otp_duration(self):
        create_user(email=self.email)
        payload = {"identifier": self.email, "intent": "login"}
        with freeze_time() as frozen_time:
            res = self.client.post(SEND_OTP_URL, payload)

            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertEqual(res.data["ttl"], 120)

            frozen_time.tick(60)
            res = self.client.post(SEND_OTP_URL, payload)

            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertEqual(res.data["ttl"], 60)

            self.assertEqual(len(mail.outbox), 1)

    @override_settings(OTP_MAX_GENERATE_COUNT=2, OTP_DURATION=10)
    def test_too_many_otp_request(self):
        create_user(email=self.email, username=self.username)
        payload = {"identifier": self.username, "intent": "login", "channel": "email"}

        with freeze_time() as frozen_time:
            res = self.client.post(SEND_OTP_URL, payload)
            self.assertEqual(res.status_code, status.HTTP_200_OK)

            frozen_time.tick(11)

            res = self.client.post(SEND_OTP_URL, payload)
            self.assertEqual(res.status_code, status.HTTP_200_OK)

            frozen_time.tick(11)

            res = self.client.post(SEND_OTP_URL, payload)
            self.assertEqual(res.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
            self.assertEqual(res.data["code"], "too_many_request")
            self.assertEqual(
                res.data["message"],
                "تعداد درخواست بیش از حد مجاز, مدتی دیگر امتحان کنید.",
            )

    def test_login_non_existent_email(self):
        payload = {"identifier": self.email, "intent": "login"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(res.data["code"], "user_not_found")
        self.assertEqual(res.data["message"], "کاربری با این مشخصات یافت نشد.")

    def test_login_non_existent_phone(self):
        payload = {"identifier": self.phone, "intent": "login"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(res.data["code"], "user_not_found")
        self.assertEqual(res.data["message"], "کاربری با این مشخصات یافت نشد.")

    def test_login_non_existent_username(self):
        payload = {"identifier": self.username, "intent": "login", "channel": "email"}
        res = self.client.post(SEND_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(res.data["code"], "user_not_found")
        self.assertEqual(res.data["message"], "کاربری با این مشخصات یافت نشد.")


class VerifyOtpTests(APITestCase):

    def setUp(self):
        self.email = "test@example.com"
        self.phone = "09101234567"
        self.username = "test_username"

    def test_register_email(self):
        code = create_register_otp(self.email, "email")
        payload = {"identifier": self.email, "intent": "register", "code": code}
        res = self.client.post(VERIFY_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)
        self.assertTrue(User.objects.filter(email=self.email).exists())

    def test_register_phone(self):
        code = create_register_otp(self.phone, "phone")
        payload = {"identifier": self.phone, "intent": "register", "code": code}
        res = self.client.post(VERIFY_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)
        self.assertTrue(User.objects.filter(phone=self.phone).exists())

    @override_settings(OTP_DURATION=10)
    def test_expired_code(self):
        with freeze_time() as frozen_time:
            code = create_register_otp(self.email, "email")
            payload = {"identifier": self.email, "intent": "register", "code": code}

            frozen_time.tick(11)

            res = self.client.post(VERIFY_OTP_URL, payload)
            self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
            self.assertEqual(res.data["code"], "invalid_or_expired")
            self.assertEqual(
                res.data["message"], "کد وارد شده نامعتبر یا منقضی شده است."
            )

    def test_incorrect_code(self):
        create_register_otp(self.email, "email")
        payload = {"identifier": self.email, "intent": "register", "code": "000000"}
        res = self.client.post(VERIFY_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(res.data["code"], "invalid_or_expired")
        self.assertEqual(res.data["message"], "کد وارد شده نامعتبر یا منقضی شده است.")

    @override_settings(OTP_MAX_ATTEMPT=2)
    def test_max_attempt_exceeded(self):
        create_register_otp(self.email, "email")
        payload = {"identifier": self.email, "intent": "register", "code": "000000"}

        res = self.client.post(VERIFY_OTP_URL, payload)
        self.assertEqual(res.data["code"], "invalid_or_expired")

        res = self.client.post(VERIFY_OTP_URL, payload)
        self.assertEqual(res.data["code"], "invalid_or_expired")

        res = self.client.post(VERIFY_OTP_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(res.data["code"], "too_many_request")
        self.assertEqual(
            res.data["message"],
            "تعداد درخواست بیش از حد مجاز, مدتی دیگر امتحان کنید.",
        )

    def test_login_email(self):
        create_user(email=self.email)
        code = create_login_otp(self.email, "email")
        payload = {"identifier": self.email, "intent": "login", "code": code}
        res = self.client.post(VERIFY_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)

    def test_login_phone(self):
        create_user(phone=self.phone)
        code = create_login_otp(self.phone, "phone")
        payload = {"identifier": self.phone, "intent": "login", "code": code}
        res = self.client.post(VERIFY_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)

    def test_login_username_with_email_channel(self):
        create_user(email=self.email, username=self.username)
        code = create_login_otp(self.email, channel="email")
        payload = {
            "identifier": self.username,
            "intent": "login",
            "code": code,
            "channel": "email",
        }
        res = self.client.post(VERIFY_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)

    def test_login_username_with_phone_channel(self):
        create_user(phone=self.phone, username=self.username)
        code = create_login_otp(self.phone, "phone")
        payload = {
            "identifier": self.username,
            "intent": "login",
            "channel": "phone",
            "code": code,
        }
        res = self.client.post(VERIFY_OTP_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)


class PasswordLoginTests(APITestCase):
    def setUp(self):
        self.email = "test@example.com"
        self.phone = "09101234567"
        self.username = "test_username"

    def test_login_email(self):
        create_user(email=self.email, password="testpass")
        payload = {"identifier": self.email, "password": "testpass"}
        res = self.client.post(PASSWORD_LOGIN_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)

    def test_login_phone(self):
        create_user(phone=self.phone, password="testpass")
        payload = {"identifier": self.phone, "password": "testpass"}
        res = self.client.post(PASSWORD_LOGIN_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)

    def test_login_username(self):
        create_user(email=self.email, username=self.username, password="testpass")
        payload = {"identifier": self.username, "password": "testpass"}
        res = self.client.post(PASSWORD_LOGIN_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)

    def test_incorrect_password(self):
        create_user(email=self.email, password="testpass")
        payload = {"identifier": self.email, "password": "incorrectPass"}
        res = self.client.post(PASSWORD_LOGIN_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(res.data["code"], "incorrect_information")
        self.assertEqual(res.data["message"], "رمز عبور اشتباه است.")

    def test_non_existent_user(self):
        payload = {"identifier": self.email, "password": "testpass"}
        res = self.client.post(PASSWORD_LOGIN_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(res.data["code"], "incorrect_information")
        self.assertEqual(res.data["message"], "رمز عبور اشتباه است.")


class RefreshViewTests(APITestCase):
    def test_not_authenticated(self):
        res = self.client.post(REFRESH_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(res.data["code"], "invalid_or_expired_token")
        self.assertEqual(res.data["message"], "No valid token found.")

    def test_valid_token(self):
        user = create_user(email="test@example.com")
        session = self.client.session
        session["refresh_token"] = str(RefreshToken.for_user(user))
        session.save()

        res = self.client.post(REFRESH_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)

    def test_expired_token(self):
        with freeze_time() as frozen_time:
            user = create_user(email="test@example.com")
            session = self.client.session
            RefreshToken.lifetime = timedelta(seconds=10)
            session["refresh_token"] = str(RefreshToken.for_user(user))
            session.save()

            frozen_time.tick(11)

            res = self.client.post(REFRESH_URL)

            self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
            self.assertEqual(res.data["code"], "invalid_or_expired_token")
            self.assertEqual(res.data["message"], "No valid token found.")


class LogoutViewTests(APITestCase):

    def test_logout(self):
        user = create_user(email="test@example.com")
        session = self.client.session
        session["refresh_token"] = str(RefreshToken.for_user(user))
        session.save()

        res = self.client.post(LOGOUT_URL)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(self.client.session.is_empty())


class SettingsViewTests(APITestCase):

    def setUp(self):
        self.email = "test@example.com"
        self.phone = "09101234567"
        self.username = "test_username"
        self.password = "testPass"

        self.user = create_user(
            email=self.email,
            phone=self.phone,
            username=self.username,
            password=self.password,
        )

    def test_not_authenticated(self):
        res = self.client.get(SETTINGS_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        # TODO assert the error response code and message

    def test_get_settings(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(SETTINGS_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_update_settings(self):
        self.client.force_authenticate(user=self.user)
        payload = {"name": "test name", "about_me": "test about me"}
        res = self.client.post(SETTINGS_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, payload["name"])
        self.assertEqual(self.user.about_me, payload["about_me"])

    def test_update_username(self):
        self.client.force_authenticate(user=self.user)
        payload = {"username": "updated_username"}
        res = self.client.post(SETTINGS_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, payload["username"])

    def test_invalid_username(self):
        self.client.force_authenticate(user=self.user)
        payload = {"username": "invalid username"}
        res = self.client.post(SETTINGS_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['errors'][0]['code'], "invalid")
        self.assertEqual(
            res.data['errors'][0]["message"],
            "نام کاربری فقط میتواند شامل حروف لاتین, آندرلاین, نقطفه و خط فاصله باشد.",
        )

    def test_duplicate_username(self):
        self.client.force_authenticate(user=self.user)
        payload = {"username": "duplicate_username"}
        create_user(email="another@example.com", username=payload["username"])

        res = self.client.post(SETTINGS_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['errors'][0]["code"], "duplicate_username")
        self.assertEqual(res.data['errors'][0]["message"], "نام کاربری تکراری است.")

    def test_update_avatar(self):
        self.client.force_authenticate(self.user)

        with NamedTemporaryFile(suffix=".jpg") as file:
            img = Image.new(mode="RGB",size=(100, 100))
            img.save(file, "JPEG")
            file.seek(0)

            payload = {"avatar": file}
            res = self.client.post(SETTINGS_URL, payload)

            self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_email_update_is_ignored(self):
        self.client.force_authenticate(self.user)
        payload = {"email": "updated@example.com"}
        res = self.client.post(SETTINGS_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, self.email)
        self.assertNotEqual(self.user.email, payload["email"])

    def test_phone_update_is_ignored(self):
        self.client.force_authenticate(self.user)
        payload = {"phone": "09107654321"}
        res = self.client.post(SETTINGS_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.phone, self.phone)
        self.assertNotEqual(self.user.phone, payload["phone"])

    def test_password_update_is_ignored(self):
        self.client.force_authenticate(self.user)
        payload = {"password": "newPass"}
        res = self.client.post(SETTINGS_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.password))
        self.assertFalse(self.user.check_password(payload["password"]))
