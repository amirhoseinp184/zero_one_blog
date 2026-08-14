from django.contrib.auth import get_user_model
from django.utils.html import strip_tags
from django.utils.text import Truncator

from rest_framework import serializers

from posts import models as postModels


User = get_user_model()


class PostListSerializer(serializers.ModelSerializer):
    excerpt = serializers.SerializerMethodField()
    class Meta:
        model = postModels.Post
        fields = ("status", "title", "slug", "published_at", 'excerpt', 'content')
        read_only_fields = ('slug',)
        extra_kwargs = {
            'title': {'min_length': 10, 'max_length': 100},
            'content': {'write_only': True, 'min_length': 300}
        }

    def get_excerpt(self, obj):
        content = strip_tags(obj.content)
        return Truncator(content).chars(140)


class AuthorPreviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "name", "avatar")


class PostDetailSerializer(serializers.ModelSerializer):
    author = AuthorPreviewSerializer(read_only=True)
    class Meta:
        model = postModels.Post
        fields = ("author" ,"status", "title", "content")
        extra_kwargs = {
            'title': {'min_length': 10, 'max_length': 100},
            'content': {'min_length': 300}
        }


class PublicPostListSerializer(serializers.ModelSerializer):
    author = AuthorPreviewSerializer()
    excerpt = serializers.SerializerMethodField()
    class Meta:
        model = postModels.Post
        fields= ("title", 'content', 'slug', 'reading_time_minutes', 'updated_at', 'excerpt', 'author')

    def get_excerpt(self, obj):
            content = strip_tags(obj.content)
            return Truncator(content).chars(140)
    
class PublicPostRetrieveSerializer(serializers.ModelSerializer):
    author=AuthorPreviewSerializer()
    class Meta:
        model = postModels.Post
        fields = ('title', 'content', 'status', 'reading_time_minutes', 'updated_at', 'author')



class UserFeedPostSerializer(PostListSerializer):
    author = AuthorPreviewSerializer()
    class Meta(PostListSerializer.Meta):
        fields = ("title", "slug", "published_at", 'excerpt', 'content', 'author', 'reading_time_minutes')