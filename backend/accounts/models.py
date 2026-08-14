import string
from datetime import timedelta

from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.utils.crypto import get_random_string, constant_time_compare
from django.utils import timezone
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

from phonenumber_field.modelfields import PhoneNumberField


class RateLimitExceeded(Exception):
    """Raised when generate rate limit exceeded."""

    pass


class MaxThrottleAttemptExceed(Exception):
    """Raised when verification attempts exceeded."""

    pass


class UserManager(BaseUserManager):
    def _create_user(
        self, username=None, name=None, email=None, phone=None, password=None, **extra_fields
    ):
        if (not email) & (not phone):
            raise ValueError("eighter of email for email must be provided.")

        user = self.model(
            username=username,
            name=name,
            email=self.normalize_email(email),
            phone=phone,
            **extra_fields,
        )
        if not password:
            user.set_unusable_password()
        else:
            user.set_password(password)

        user.save()
        return user

    def create_user(
        self, username=None, name=None, email=None, phone=None, password=None, **extra_fields
    ):
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_staff", False)
        return self._create_user(
            username=username,
            name=name,
            email=email,
            phone=phone,
            password=password,
            **extra_fields,
        )

    def create_superuser(
        self, username=None, name=None, email=None, phone=None, password=None, **extra_fields
    ):
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_staff", True)
        if not extra_fields["is_superuser"]:
            raise ValueError("superuser must have is_superuser=true")
        if not extra_fields["is_staff"]:
            raise ValueError("superuser must have is_staff=true")

        return self._create_user(
            username=username,
            name=name,
            email=email,
            phone=phone,
            password=password,
            **extra_fields,
        )


class User(AbstractBaseUser, PermissionsMixin):
    class GenderChoices(models.TextChoices):
        MALE = 'MALE', 'male'
        FEMALE = 'FEMALE', 'female'
        OTHER = 'OTHER', 'other'

    name = models.CharField(null=False, blank=True)
    username = models.CharField(unique=True, null=False, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = PhoneNumberField(unique=True, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    about_me = models.TextField(null=True, blank=True)
    gender = models.TextField(choices=GenderChoices, null=True, blank=True)
    birthdate = models.DateField(null=True, blank=True)
    following = models.ManyToManyField(
        'self',
        through='Follow',
        through_fields=('follower', 'following'),
        symmetrical=False,
        related_name='followers'
    )
    

    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    objects = UserManager()

    def __str__(self):
        return f"username: {self.username}, {'email' if self.email else 'phone'}: {self.email if self.email else self.phone}"

    def save(
        self,
        *args,
        force_insert=False,
        force_update=False,
        using=None,
        update_fields=None,
    ):
        random_string = get_random_string(10)
        if not self.username:
            self.username = f'm_{random_string}'
        if not self.name:
            self.name = random_string

        return super().save(*args, force_insert, force_update, using, update_fields)

    def follow(self, user_to_follow):
        """Follow another user."""
        if self != user_to_follow:
            Follow.objects.get_or_create(
                follower=self, following=user_to_follow
            )

    def unfollow(self, user_to_unfollow):
        """Unfollow another user."""
        Follow.objects.filter(
            follower=self, following=user_to_unfollow
        ).delete()

    def is_following(self, user):
        """Check if self is following the given user."""
        return self.following.filter(id=user.id).exists()

    def is_followed_by(self, user):
        """Check if self is followed by the given user."""
        return self.followers.filter(id=user.id).exists()
    



class Otp(models.Model):
    class OtpTypes(models.TextChoices):
        REGISTER = "REGISTER", "register"
        LOGIN = (
            "LOGIN",
            "login",
        )
        FORGOT_PASSWORD = "FORGOT_PASSWORD", "forgot_password"

    type = models.CharField(
        max_length=30, choices=OtpTypes.choices, default=OtpTypes.REGISTER
    )
    code = models.CharField(max_length=20, null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # throtling fields
    failed_attempts = models.PositiveSmallIntegerField(default=0)
    failed_attempt_frame_start = models.DateTimeField(null=True, blank=True)

    # rate-limiting fields
    generated_count = models.PositiveSmallIntegerField(default=0)
    generate_frame_start = models.DateTimeField(null=True, blank=True)

    def _normilize_period(self, time):
        if isinstance(time, int):
            return timedelta(seconds=time)
        return time

    def generate_code(
        self,
        generate_period=None,
        max_generate_count=None,
        valid_until=None,
        code_length=None,
    ):
        generate_period = self._normilize_period(generate_period or self.get_generate_period())
        valid_until = self._normilize_period(valid_until or self.get_duration())
        max_generate_count = max_generate_count or self.get_max_generate_count()
        code_length = code_length or self.get_length()

        now = timezone.now()

        if (
            self.generate_frame_start is None
            or now > self.generate_frame_start + generate_period
        ):
            self.generated_count = 0
            self.generate_frame_start = now

        self.generated_count += 1

        if self.generated_count > max_generate_count:
            raise RateLimitExceeded

        self.code = get_random_string(length=code_length, allowed_chars=string.digits)
        self.expires_at = now + valid_until

        # resset verify throttle
        self.failed_attempts = 0
        self.failed_attempt_frame_start = None

        self.save()

    def verify(self, code, max_attempts=None, attempts_period=None):
        attempts_period = self._normilize_period(attempts_period or self.get_attempt_period())
        max_attempts = max_attempts or self.get_max_attempt()
        now = timezone.now()

        if not self.code or (self.expires_at and now > self.expires_at):
            return False

        if (
            self.failed_attempt_frame_start
            and now > self.failed_attempt_frame_start + attempts_period
        ):
            self.failed_attempts = 0
            self.failed_attempt_frame_start = None

        if self.failed_attempts >= max_attempts:
            raise MaxThrottleAttemptExceed

        is_verified = constant_time_compare(self.code, code)
        if is_verified:
            self.code = None
            self.expires_at = None
            self.failed_attempts = 0
            self.failed_attempt_frame_start = None
            self.save()
            return is_verified
        else:
            if self.failed_attempt_frame_start is None:
                self.failed_attempt_frame_start = now
            self.failed_attempts += 1
            self.save()
            return False

    def is_still_valid(self):
        now = timezone.now()
        if not self.code or now > self.expires_at:
            return False
        return True

    @property
    def ttl(self):
        now = timezone.now()
        if (not self.code or now > self.expires_at):
            return 0
        return round((self.expires_at - now).total_seconds())

    class Meta:
        abstract = True

    def __str__(self):
        return f"otp: {self.code}"


    @staticmethod
    def get_duration():
        return getattr(settings, 'OTP_DURATION', 120)
    
    @staticmethod
    def get_max_attempt():
        return getattr(settings, 'OTP_MAX_ATTEMPT', 500)

    @staticmethod
    def get_attempt_period():
        return getattr(settings, 'OTP_ATTEMPT_PERIOD', 3600)

    @staticmethod
    def get_max_generate_count():
        return getattr(settings, 'OTP_MAX_GENERATE_COUNT', 500)

    @staticmethod
    def get_generate_period():
        return getattr(settings, 'OTP_GENERATE_PERIOD', 3600)
    
    @staticmethod
    def get_length():
        return getattr(settings, 'OTP_LENGTH', 6)


class PhoneOtpSendError(Exception):
    pass


class PhoneOtp(Otp):
    phone = PhoneNumberField(null=False, blank=False)

    def send_code(self):
        if not self.code:
            raise PhoneOtpSendError

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["type", "phone"], name="unique_type_phone")
        ]

class RegisterPhoneOtpManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(type=self.model.OtpTypes.REGISTER)

class RegisterPhoneOtp(PhoneOtp):
    objects = RegisterPhoneOtpManager()

    def save(self, *args, **kwargs):
        self.type = self.OtpTypes.REGISTER
        return super().save(*args, **kwargs)

    class Meta:
        proxy = True



class LoginPhoneOtpManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(type=self.model.OtpTypes.LOGIN)

class LoginPhoneOtp(PhoneOtp):
    objects = LoginPhoneOtpManager()

    def save(self, *args, **kwargs):
        self.type = self.OtpTypes.LOGIN
        return super().save(*args, **kwargs)

    class Meta:
        proxy = True



class ForgotPasswordPhoneOtpManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(type=self.model.OtpTypes.FORGOT_PASSWORD)

class ForgotPasswordPhoneOtp(PhoneOtp):
    objects = ForgotPasswordPhoneOtpManager()

    def save(self, *args, **kwargs):
        self.type = self.OtpTypes.FORGOT_PASSWORD
        return super().save(*args, **kwargs)

    class Meta:
        proxy = True



class EmailOtpSendError(Exception):
    pass


class EmailOtp(Otp):
    email = models.EmailField(null=False, blank=False)

    def send_code(self):
        if not self.code:
            raise EmailOtpSendError

        type_to_tempalte_mapping = {
            EmailOtp.OtpTypes.REGISTER: "EMAIL_OTP_REGISTER_TEMPLATE",
            EmailOtp.OtpTypes.LOGIN: "EMAIL_OTP_LOGIN_TEMPLATE",
            EmailOtp.OtpTypes.FORGOT_PASSWORD: "EMAIL_OTP_FORGOT_PASSWORD_TEMPLATE",
        }

        setting = type_to_tempalte_mapping[self.type]

        template = getattr(settings, setting)

        html_message = render_to_string(template, {"code": self.code}, None)
        plain_message = strip_tags(html_message)

        # send_mail(
        #     subject="کد تایید",
        #     from_email=None,
        #     recipient_list=[self.email],
        #     message=plain_message,
        #     html_message=html_message,
        # )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["type", "email"], name="unique_type_email")
        ]


class RegisterEmailOtpManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(type=self.model.OtpTypes.REGISTER)


class RegisterEmailOtp(EmailOtp):
    objects = RegisterEmailOtpManager()

    def save(self, *args, **kwargs):
        self.type = self.OtpTypes.REGISTER
        return super().save(*args, **kwargs)

    class Meta:
        proxy = True


class LoginEmailOtpManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(type=self.model.OtpTypes.LOGIN)


class LoginEmailOtp(EmailOtp):
    objects = LoginEmailOtpManager()

    def save(self, *args, **kwargs):
        self.type = self.OtpTypes.LOGIN
        return super().save(*args, **kwargs)

    class Meta:
        proxy = True


class ForgotPasswordEmailOtpManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(type=self.model.OtpTypes.FORGOT_PASSWORD)


class ForgotPasswordEmailOtp(EmailOtp):
    objects = ForgotPasswordEmailOtpManager()

    def save(self, *args, **kwargs):
        self.type = self.OtpTypes.FORGOT_PASSWORD
        return super().save(*args, **kwargs)

    class Meta:
        proxy = True


class Follow(models.Model):
    follower = models.ForeignKey(
        User,
        related_name="following_relationships",
        on_delete=models.CASCADE
    )
    following = models.ForeignKey(
        User,
        related_name='followers_relationships',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['follower', 'following'], name='unique_followers'
            )
        ]
        ordering=['-created_at']

    def clean(self):
        if self.follower == self.following:
            raise ValidationError("Users cannot follow themeselves.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.follower} follows {self.following}'

