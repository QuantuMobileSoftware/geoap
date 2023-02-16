"""
SIP URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from .docs_drf_yasg import urlpatterns as doc_urls
from rest_auth.views import LoginView, LogoutView, UserDetailsView


api_patterns = [
    path('login', LoginView.as_view(), name='rest_login'),
    path('logout', LogoutView.as_view(), name='rest_logout'),
    path('users/current', UserDetailsView.as_view(), name='rest_user_details'),
    path('', include("publisher.urls")),
    path('', include("aoi.urls")),
    path('', include("transaction.urls"))
]
api_patterns.extend(doc_urls)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_patterns)),
]

