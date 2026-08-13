from django.db.models import Window, F
from django.db.models.functions import RowNumber

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import CursorPagination

from . import serializers
from posts import models as PostsModels


class PostListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.PostListSerializer
    queryset = PostsModels.Post.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.filter(author=self.request.user)

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.PostDetailSerializer
    queryset = PostsModels.Post.objects.all()
    lookup_field = "slug"

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.filter(author=self.request.user)

        return queryset


class PublicPostRetriveView(generics.RetrieveAPIView):
    queryset = PostsModels.Post.objects.filter(status=PostsModels.Post.Status.PUBLISHED)
    serializer_class = serializers.PublicPostRetrieveSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        username = self.kwargs['username']
        queryset = super().get_queryset()
        queryset = queryset.filter(author__username=username)

        return queryset


class CustomCursorPagination(CursorPagination):
    ordering = 'created_at'

class UserFeedView(generics.ListAPIView, generics.GenericAPIView):
    serializer_class = serializers.UserFeedPostSerializer
    pagination_class = CustomCursorPagination

    def get_queryset(self):
        # Rank each post per author by recency
        queryset = PostsModels.Post.objects.annotate(
            author_rank=Window(
                expression=RowNumber(),
                partition_by=[F('author_id')],
                order_by=F('created_at').desc()
            )
        ).filter(author_rank__lte=2).order_by('-created_at') # Max 2 posts per author
        return queryset


        