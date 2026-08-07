from rest_framework import serializers

from posts import models as postModels


class PostListCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = postModels.Post
        fields = ("status", "title","slug", "content", "reading_time_minutes", "published_at", "updated_at")
        read_only_fields = ('slug',)



class PublicPostRetrieveSerializer(serializers.ModelSerializer):

    class Meta:
        model = postModels.Post
        fields = ('title', 'content', 'status', 'reading_time_minutes', 'updated_at')

