from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.urls import reverse
from django.utils.encoding import force_bytes, force_str
from rest_auth.views import UserDetailsView
from rest_framework.response import Response
from notificator.models import Email
from notificator.utils import send_email_from_template_async

# Create your views here.

class CustomUserDetailsView(UserDetailsView):
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        if "email" in serializer.validated_data and  request.user.email != serializer.validated_data['email']:
            token = default_token_generator.make_token(instance)
            uidb64 = urlsafe_base64_encode(force_bytes(str(instance.pk)))
            url = reverse(
                "verify_email",
                kwargs={
                    "uidb64":uidb64,
                    "token":token
                }
            )
            send_email_from_template_async(
                template="email_confirmation.html",
                subject="Please, verify email",
                recipient_email=serializer.validated_data['email'],
                context={
                    "link":request.build_absolute_uri(url)
                }
            )
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
    pass

@api_view(['GET'])    
@authentication_classes([])
@permission_classes([])
def recieve_email_verification(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user and default_token_generator.check_token(user, token):
        user.email_verified = True
        user.save()
        return Response({"email":user.email, "verified":True},
            status.HTTP_202_ACCEPTED
        )
    else:
        return Response({"verified":False},status.HTTP_400_BAD_REQUEST)
    