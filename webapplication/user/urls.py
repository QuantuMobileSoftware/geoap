from django.urls import path   
from . import views

urlpatterns = [
    path("user/<uidb64>/<token>", views.recieve_email_verification, name="verify_email"),
]