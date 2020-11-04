"""
SIP URL Configuration
"""
from django.contrib import admin
from django.urls import path, include

from rest_auth.views import LoginView, LogoutView, UserDetailsView
from rest_framework_swagger.views import get_swagger_view

schema_view = get_swagger_view(title='SIP APIs')

api_patterns = [
    path('login', LoginView.as_view(), name='rest_login'),
    path('logout', LogoutView.as_view(), name='rest_logout'),
    path('users/current', UserDetailsView.as_view(), name='rest_user_details'),
    path('docs', schema_view),
    path('', include("publisher.urls")),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_patterns)),
]
