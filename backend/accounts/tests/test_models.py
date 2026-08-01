from freezegun import freeze_time
from datetime import timedelta

from django.test import TestCase, override_settings
from django.utils import timezone
from django.core import mail
from unittest.mock import patch

from accounts import models
from common.test import AbstractModelMixinTestCase


class TestUserModel(TestCase):

    def test_str_user_with_email(self):
        user = models.User(username="username", email="test@example.com")

        self.assertEqual(str(user), f"username: username, email: test@example.com")

    def test_str_user_with_phone(self):
        user = models.User(username="username", phone="+989123456789")

        self.assertEqual(str(user), f"username: username, phone: +989123456789")

    @patch("accounts.models.get_random_string")
    def test_generate_random_username_and_name_when_not_provided(self, mocked_random):
        mocked_random.return_value = "random_username"
        user = models.User.objects.create_user(
            username="", name="", email="test@example.com"
        )
        self.assertEqual(user.username, "random_username")
        self.assertEqual(user.name, "random_username")

    def test_create_user_without_email(self):
        models.User.objects.create_user(phone="+989123456789")

    def test_create_user_without_phone(self):
        models.User.objects.create_user(email="test@example.com")

    def test_create_user_without_both_email_phone_error(self):
        with self.assertRaisesMessage(
            expected_exception=ValueError,
            expected_message="eighter of email for email must be provided.",
        ):
            models.User.objects.create_user()

    def test_create_superuser(self):
        user = models.User.objects.create_superuser(phone="+989123456789")
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)


class TestAbstractOtpModel(AbstractModelMixinTestCase):
    mixin = models.Otp

    def setUp(self):
        self.otp = self.model()

    @patch("accounts.models.get_random_string")
    def test_generate_code(self, mocked_random):
        now = timezone.now()
        mocked_random.return_value = "123456"
        with freeze_time(now):
            self.otp.generate_code(valid_until=timedelta(seconds=120))
            self.assertEqual(self.otp.code, "123456")
            self.assertEqual(self.otp.expires_at, now + timedelta(seconds=120))
            self.assertTrue(self.otp.code.isdigit())
            self.assertEqual(self.otp.generate_frame_start, now)
            self.assertEqual(self.otp.generated_count, 1)

    def test_generate_frame_start_at_repeated_generate_code(self):
        now = timezone.now()
        with freeze_time(now) as frozen_time:
            self.otp.generate_code()
            self.assertEqual(self.otp.generate_frame_start, now)
            self.assertEqual(self.otp.generated_count, 1)

            frozen_time.tick(timedelta(minutes=5))

            self.otp.generate_code()
            self.assertEqual(self.otp.generate_frame_start, now)
            self.assertEqual(self.otp.generated_count, 2)

    def test_generate_frame_reset_after_period(self):
        now = timezone.now()
        with freeze_time(now) as frozen_time:
            self.otp.generate_code(generate_period=timedelta(hours=24))
            self.assertEqual(self.otp.generate_frame_start, now)
            self.assertEqual(self.otp.generated_count, 1)

            frozen_time.tick(timedelta(hours=24, seconds=1))
            self.otp.generate_code(generate_period=timedelta(hours=24))
            self.assertEqual(
                self.otp.generate_frame_start, now + timedelta(hours=24, seconds=1)
            )
            self.assertEqual(self.otp.generated_count, 1)

    def test_rate_limiting_during_generate_frame(self):
        now = timezone.now()
        with freeze_time(now):
            self.otp.generate_code(max_generate_count=3)
            self.otp.generate_code(max_generate_count=3)
            self.otp.generate_code(max_generate_count=3)
            with self.assertRaises(models.RateLimitExceeded):
                self.otp.generate_code(max_generate_count=3)

    @patch("accounts.models.get_random_string")
    def test_verify(self, mocked_random):
        mocked_random.return_value = "123456"
        self.otp.generate_code()
        self.assertTrue(self.otp.verify("123456"))
        self.assertIsNone(self.otp.code)
        self.assertIsNone(self.otp.expires_at)

    @patch("accounts.models.get_random_string")
    def test_verify_no_reuse(self, mocked_random):
        mocked_random.return_value = "123456"
        self.otp.generate_code()
        self.assertTrue(self.otp.verify("123456"))
        self.assertFalse(self.otp.verify("123456"))

    def test_verify_incorrect_code(self):
        self.otp.generate_code()
        self.assertFalse(self.otp.verify("000000"))

    @patch("accounts.models.get_random_string")
    def test_expired_otp(self, mocked_random):
        mocked_random.return_value = "123456"
        with freeze_time() as frozen_time:
            self.otp.generate_code(valid_until=timedelta(seconds=120))
            frozen_time.tick(timedelta(seconds=121))
            self.assertFalse(self.otp.verify("123456"))

    def test_throttle_set_after_first_failed_verify(self):
        now = timezone.now()
        with freeze_time(now):
            self.otp.generate_code()
            self.assertEqual(self.otp.failed_attempts, 0)
            self.assertIsNone(self.otp.failed_attempt_frame_start)

            self.otp.verify("000000")

            self.assertEqual(self.otp.failed_attempts, 1)
            self.assertEqual(self.otp.failed_attempt_frame_start, now)

    def test_max_throttle_attempt(self):
        now = timezone.now()
        with freeze_time(now):
            self.otp.generate_code()
            self.otp.verify("000000", max_attempts=3)
            self.otp.verify("000000", max_attempts=3)
            self.otp.verify("000000", max_attempts=3)

            with self.assertRaises(models.MaxThrottleAttemptExceed):
                self.otp.verify("000000", max_attempts=3)

    def test_throttle_reset_after_frame_passed(self):
        now = timezone.now()
        with freeze_time(now) as frozen_time:
            self.otp.generate_code(valid_until=timedelta(hours=2))
            self.otp.verify(
                "000000", max_attempts=3, attempts_period=timedelta(hours=1)
            )
            self.otp.verify("000000", max_attempts=3)
            self.otp.verify("000000", max_attempts=3)

            frozen_time.tick(timedelta(hours=1, seconds=1))

            self.otp.verify(
                "000000", max_attempts=3, attempts_period=timedelta(hours=1)
            )
            self.assertEqual(self.otp.failed_attempts, 1)
            self.assertEqual(
                self.otp.failed_attempt_frame_start, now + timedelta(hours=1, seconds=1)
            )

    def test_verify_throttle_reset_after_new_code_generated(self):
        now = timezone.now()
        with freeze_time(now):
            self.otp.generate_code()
            self.otp.verify("000000")
            self.otp.verify("000000")

            self.otp.generate_code()
            self.assertEqual(self.otp.failed_attempts, 0)
            self.assertIsNone(self.otp.failed_attempt_frame_start)
        
    def test_is_still_valid_with_valid_code(self):
        self.otp.generate_code()
        self.assertTrue(self.otp.is_still_valid())

    def test_is_still_valid_with_expired_code(self):
        with freeze_time() as frozen_time:
            self.otp.generate_code(valid_until=120)
            frozen_time.tick(121)
            self.assertFalse(self.otp.is_still_valid())
    
    def test_ttl_expired_code(self):
        with freeze_time() as frozen_time:
            self.otp.generate_code(valid_until=120)
            frozen_time.tick(121)
            self.assertEqual(self.otp.ttl, 0)
    
    def test_ttl_no_code(self):
        self.assertEqual(self.otp.ttl, 0)
    
    def test_ttl_partial_time(self):
        with freeze_time() as frozen_time:
            self.otp.generate_code(valid_until=120)
            frozen_time.tick(50)
            self.assertEqual(self.otp.ttl, 70)


class TestPhoneOtpModel(TestCase):
    def test_send_otp(self):
        self.skipTest('in progress...')
        pass


class TestEmailOtpModel(TestCase):
    def setUp(self):
        self.email = "test@example.com"
        self.otp = models.EmailOtp(email=self.email)
        self.otp.type = models.EmailOtp.OtpTypes.REGISTER

    @patch("accounts.models.render_to_string")
    def test_send_code(self, mocked_renderer):
        mocked_renderer.return_value = "<p>your code '123456'</p>"
        self.otp.type = models.EmailOtp.OtpTypes.REGISTER
        with override_settings(EMAIL_OTP_REGISTER_TEMPLATE='emails/email_otp_register.html'):
            self.otp.generate_code()
            self.otp.send_code()

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.email])


    @patch("accounts.models.render_to_string")
    @patch("accounts.models.get_random_string")
    def test_send_code_type_to_template_settings(self, mocked_random, mocked_renderer):
        mocked_random.return_value = "123456"
        mocked_renderer.return_value = "<p>your code '123456'</p>"
        self.otp.generate_code()

        type_to_tempalte_mapping = {
            models.EmailOtp.OtpTypes.REGISTER: (
                "EMAIL_OTP_REGISTER_TEMPLATE",
                "emails/email_otp_register.html",
            ),
            models.EmailOtp.OtpTypes.LOGIN: (
                "EMAIL_OTP_LOGIN_TEMPLATE",
                "emails/email_otp_login.html",
            ),
            models.EmailOtp.OtpTypes.FORGOT_PASSWORD: (
                "EMAIL_OTP_FORGOT_PASSWORD_TEMPLATE",
                "emails/email_otp_forgot_password.html",
            ),
        }

        for otp_type, (setting, template) in type_to_tempalte_mapping.items():
            with override_settings(**{setting: template}):
                self.otp.type = otp_type
                self.otp.send_code()
                mocked_renderer.assert_called_with(template, {'code': '123456'}, None)

    def test_send_code_before_generating_code(self):
        self.assertIsNone(self.otp.code)
        with self.assertRaises(models.EmailOtpSendError):
            self.otp.send_code()
    