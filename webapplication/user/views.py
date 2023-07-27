from allauth.account.views import ConfirmEmailView
from dj_rest_auth.registration.views import RegisterView as BasicRegisterView
from django.conf import settings
from django.contrib.auth.models import Group
from django.http import Http404
from django.utils.translation import gettext_lazy as _
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView
from dj_rest_auth.views import UserDetailsView

from user.models import Transaction
from aoi.models import Component
from django.db.models import Q
from user.serializers import TransactionSerializer
from waffle import switch_is_active



class RegisterView(BasicRegisterView):
    def perform_create(self, serializer):
        user = super().perform_create(serializer)
        client_group = Group.objects.get(name="Client")
        user.groups.add(client_group)
        user.start_trial()
        return user


class CustomUserDetailsView(UserDetailsView):
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        component_with_remote_executions = Component.objects.filter(Q(success=True) & Q(geoap_creds_required=True))
        response.data['server_for_calculation_is_needed'] = component_with_remote_executions.exists()
        if component_with_remote_executions.exists():
            server_is_overloaded_notification = switch_is_active('our_server_is_overloaded_notification')
            remote_server_available = switch_is_active('remote_server_available')
            if server_is_overloaded_notification:
                response.data['remote_server_available'] = False
            else:
                response.data['remote_server_available'] = remote_server_available
        return response


class VerifyEmailView(APIView, ConfirmEmailView):
    permission_classes = (AllowAny,)
    allowed_methods = ('GET', 'OPTIONS', 'HEAD')

    def verify_email(self):
        confirmation = self.get_object()
        confirmation.confirm(self.request)

    def get(self, *args, **kwargs):
        try:
            self.verify_email()
        except Http404:
            raise NotFound(_("Email verification failed"))
        return Response(data=_("Email has been successfully confirmed!"), status=HTTP_200_OK)


class TransactionListAPIView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.has_perm("user.view_all_transactions"):
            return queryset
        return queryset.filter(user=self.request.user)
