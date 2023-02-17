"""
SIP URL Configuration
"""
from allauth.account.views import EmailVerificationSentView
from dj_rest_auth.registration.views import ResendEmailVerificationView, RegisterView
from dj_rest_auth.views import LoginView, LogoutView, UserDetailsView, PasswordResetView, PasswordResetConfirmView, \
    PasswordChangeView
from django.contrib import admin
from django.urls import path, include, re_path

from user.views import VerifyEmailView
from .docs_drf_yasg import urlpatterns as doc_urls


auth_patterns = [
    path('login', LoginView.as_view(), name='rest_login'),
    path('logout', LogoutView.as_view(), name='rest_logout'),
    path('password/change/', PasswordChangeView.as_view(), name='rest_password_change'),
    path('password/reset/', PasswordResetView.as_view(), name='rest_password_reset'),
    path('password/reset/confirm/<str:uidb64>/<str:token>', PasswordResetConfirmView.as_view(),
         name='password_reset_confirm'),
    path('users/current', UserDetailsView.as_view(), name='rest_user_details'),
    path('signup/', RegisterView.as_view(), name='rest_register'),
    re_path(
        r'^signup/account-confirm-email/(?P<key>[-:\w]+)/$', VerifyEmailView.as_view(),
        name='account_confirm_email',
    ),
    path('signup/resend-email/', ResendEmailVerificationView.as_view(), name="rest_resend_email"),
    path('signup/confirm-email/', EmailVerificationSentView.as_view(), name="account_email_verification_sent")
]

api_patterns = [
    path('', include("publisher.urls")),
    path('', include("aoi.urls")),
    path('', include("transaction.urls")),
    path('', include(auth_patterns))
]
api_patterns.extend(doc_urls)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_patterns)),
]

