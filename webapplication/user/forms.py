from dj_rest_auth.forms import AllAuthPasswordResetForm
from dj_rest_auth.app_settings import api_settings
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse

try:
    from allauth.account import app_settings as allauth_account_settings
    from allauth.account.adapter import get_adapter
    from allauth.account.forms import default_token_generator
    from allauth.account.utils import (
        user_pk_to_url_str,
        user_username,
    )
    from allauth.utils import build_absolute_uri


    class PasswordResetForm(AllAuthPasswordResetForm):
        @staticmethod
        def remove_backend_prefix(url: str) -> str:
            return "/" + url.split("/", 2)[2]

        def save(self, request, **kwargs):
            current_site = get_current_site(request)
            email = self.cleaned_data['email']
            token_generator = kwargs.get('token_generator', default_token_generator)

            for user in self.users:
                temp_key = token_generator.make_token(user)
                path = reverse(
                    'password_reset_confirm',
                    args=[user_pk_to_url_str(user), temp_key],
                )
                path = self.remove_backend_prefix(path)

                if api_settings.PASSWORD_RESET_USE_SITES_DOMAIN:
                    url = build_absolute_uri(None, path)
                else:
                    url = build_absolute_uri(request, path)

                url = url.replace("%3F", "?")

                context = {
                    'current_site': current_site,
                    'user': user,
                    'password_reset_url': url,
                    'request': request,
                }
                if (
                        allauth_account_settings.AUTHENTICATION_METHOD
                        != allauth_account_settings.AuthenticationMethod.EMAIL
                ):
                    context['username'] = user_username(user)
                get_adapter(request).send_mail(
                    'account/email/password_reset_key', email, context
                )
            return self.cleaned_data['email']
except:
    from django.contrib.auth.forms import PasswordResetForm
