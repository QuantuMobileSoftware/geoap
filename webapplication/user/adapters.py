from allauth.account.adapter import DefaultAccountAdapter
from allauth.utils import build_absolute_uri
from django.urls import reverse


class AccountAdapter(DefaultAccountAdapter):
    @staticmethod
    def remove_backend_prefix(url: str) -> str:
        return "/" + url.split("/", 2)[2]

    def get_email_confirmation_url(self, request, emailconfirmation):
        url = reverse("account_confirm_email", args=[emailconfirmation.key])
        url = self.remove_backend_prefix(url)
        ret = build_absolute_uri(None, url)
        return ret
