from django.contrib.auth import get_user_model

from rest_framework import serializers

from posts import models as postModels


User = get_user_model()


class PostListCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = postModels.Post
        fields = ("status", "title","slug", "content", "reading_time_minutes", "published_at", "updated_at")
        read_only_fields = ('slug',)


class AuthorPreviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "name", "avatar")


class PostDetailSerializer(serializers.ModelSerializer):
    author = AuthorPreviewSerializer(read_only=True)
    class Meta:
        model = postModels.Post
        fields = ("author" ,"status", "title", "content")


class PublicPostRetrieveSerializer(serializers.ModelSerializer):

    class Meta:
        model = postModels.Post
        fields = ('title', 'content', 'status', 'reading_time_minutes', 'updated_at')

