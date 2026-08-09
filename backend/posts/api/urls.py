from django.urls import path

from . import views


app_name = "api"
urlpatterns = [
    path("me/posts/", views.PostListCreateAPIView.as_view(), name="post-list-create"),
    path("me/posts/<str:slug>/", views.PostRetrieveUpdateDestroyAPIView.as_view(), name="post-detail"),
    path("u/<str:username>/posts/<str:slug>/", views.PublicPostRetriveView.as_view(), name="public-post-retrieve")
]
