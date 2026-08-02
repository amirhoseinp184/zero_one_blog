from django.urls import path

from . import views


app_name = "api"
urlpatterns = [
    path("me/", views.PostListCreateAPIView.as_view(), name="post-list-create"),
]
