from django.urls import path
from . import views


app_name = "accounts-api"
urlpatterns = [
    path("check-user/", views.CheckUserView.as_view(), name="check-user"),
    path("otp/send/", views.SendOtpView.as_view(), name="send-otp"),
    path("otp/verify/", views.VerifyOtpView.as_view(), name="verify-otp"),
    path("login/password/", views.PasswordLoginView.as_view(), name="password-login"),
    path("refresh/", views.RefreshView.as_view(), name='refresh'),
    path("logout/", views.LogoutView.as_view(), name='logout'),
    path("settings/", views.SettingsView.as_view(), name='settings'),
    # path('set-password/', views.SetPasswordView.as_view(), name='set-password')
]
