from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from . import serializers
from posts import models as PostsModels


class PostListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.PostListCreateSerializer
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

