from rest_framework import serializers
from rest_framework import status

from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth import get_user_model


from phonenumber_field.phonenumber import to_python, PhoneNumber

from accounts.validators import (
    validate_phone,
    validate_username,
    mask_email,
    mask_phone,
)
from common.exceptions import ConflictError


class CheckUserSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    intent = serializers.ChoiceField(choices=["register", "login"])
    identifier_type = serializers.CharField(read_only=True)

    def validate_identifier(self, identifier: str):
        self.identifier_type = "username"

        if "@" in identifier:
            try:
                validate_email(identifier)
                self.identifier_type = "email"
            except DjangoValidationError:
                raise serializers.ValidationError(
                    "ایمیل نامعتبر است.", code="invalid_identifier"
                )

        if "+" in identifier or identifier.isdigit():
            validate_phone(
                identifier, message="شماره تلفن نامعتبر است.", code="invalid_identifier"
            )
            self.identifier_type = "phone"

        return identifier

    def validate(self, attrs):
        attrs = super().validate(attrs)
        attrs["identifier_type"] = self.identifier_type

        return attrs


class SendOtpSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    intent = serializers.ChoiceField(choices=["login", "register"])
    channel = serializers.ChoiceField(choices=["email", "phone"], required=False)
    identifier_type = serializers.CharField(read_only=True)

    def validate_identifier(self, identifier: str):
        self.identifier_type = "username"

        if "@" in identifier:
            try:
                validate_email(identifier)
                self.identifier_type = "email"
            except DjangoValidationError:
                raise serializers.ValidationError(
                    "ایمیل نامعتبر است.", code="invalid_identifier"
                )

        if "+" in identifier or identifier.isdigit():
            validate_phone(
                identifier, message="شماره تلفن نامعتبر است.", code="invalid_identifier"
            )
            self.identifier_type = "phone"

        return identifier

    def validate(self, attrs):
        attrs = super().validate(attrs)
        channel = attrs.get("channel")
        intent = attrs.get("intent")

        if self.identifier_type == "username" and intent == "login" and not channel:
            raise serializers.ValidationError(
                {"channel": "برای ورود با نام کاربری چنل الزامی است."}
            )

        attrs["identifier_type"] = self.identifier_type
        return attrs


class VerifyOtpSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    intent = serializers.ChoiceField(choices=["login", "register"])
    channel = serializers.ChoiceField(choices=["email", "phone"], required=False)
    identifier_type = serializers.CharField(read_only=True)
    code = serializers.CharField()

    def validate_identifier(self, identifier: str):
        self.identifier_type = "username"

        if "@" in identifier:
            try:
                validate_email(identifier)
                self.identifier_type = "email"
            except DjangoValidationError:
                raise serializers.ValidationError(
                    "ایمیل نامعتبر است.", code="invalid_identifier"
                )

        if "+" in identifier or identifier.isdigit():
            validate_phone(
                identifier, message="شماره تلفن نامعتبر است.", code="invalid_identifier"
            )
            self.identifier_type = "phone"

        return identifier

    def validate(self, attrs):
        attrs = super().validate(attrs)
        channel = attrs.get("channel")
        intent = attrs.get("intent")

        if self.identifier_type == "username" and intent == "login" and not channel:
            raise serializers.ValidationError(
                {"channel": "برای ورود با نام کاربری چنل الزامی است."}
            )

        attrs["identifier_type"] = self.identifier_type
        return attrs


class PasswordLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField()

    def validate_identifier(self, identifier: str):
        self.identifier_type = "username"

        if "@" in identifier:
            try:
                validate_email(identifier)
                self.identifier_type = "email"
            except DjangoValidationError:
                raise serializers.ValidationError(
                    "ایمیل نامعتبر است.", code="invalid_identifier"
                )

        if "+" in identifier or identifier.isdigit():
            validate_phone(
                identifier, message="شماره تلفن نامعتبر است.", code="invalid_identifier"
            )
            self.identifier_type = "phone"

        return identifier

    def validate(self, attrs):
        attrs = super().validate(attrs)
        attrs["identifier_type"] = self.identifier_type
        return attrs


class SettingsSerializer(serializers.Serializer):
    email = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)
    name = serializers.CharField()
    about_me = serializers.CharField()
    username = serializers.CharField()
    avatar = serializers.ImageField(allow_null=True)
    gender = serializers.ChoiceField(
        choices=[option[1] for option in get_user_model().GenderChoices.choices]
    )
    birthdate = serializers.DateField(allow_null=True)

    def validate_username(self, username):
        validate_username(username)

        if self.context["request"].user.username != username:
            if get_user_model().objects.filter(username=username).exists():
                raise serializers.ValidationError(
                    detail="نام کاربری تکراری است.", code="duplicate_username"
                )

        return username

    def update(self, instance, validated_data):
        instance.about_me = validated_data.get("about_me", instance.about_me)
        instance.username = validated_data.get("username", instance.username)
        instance.name = validated_data.get("name", instance.name)
        instance.avatar = validated_data.get("avatar", instance.avatar)
        instance.gender = validated_data.get("gender", instance.gender)
        instance.birthdate = validated_data.get("birthdate", instance.birthdate)
        instance.save()

        return instance


class PublicProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(source="followers.count", read_only=True)
    following_count = serializers.IntegerField(source="following.count", read_only=True)
    is_following = serializers.SerializerMethodField()
    class Meta:
        model=get_user_model()
        fields=("name", "avatar", "about_me", "username", "followers_count", "following_count", "is_following")

    def get_is_following(self, obj):
        request = self.context.get('request')

        if not request or not request.user or request.user.is_anonymous:
            return False
        if request.user == obj:
            return False

        return request.user.is_following(obj)
        