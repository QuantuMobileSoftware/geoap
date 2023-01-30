import logging
from typing import Callable
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.module_loading import import_string

logger = logging.getLogger(__name__)

def send_email_from_template(template: str, recipient_email:str, subject:str=None, context: dict=None):
    send_mail(
                subject=subject,
                message=render_to_string(
                    template,
                    context
                ),
                recipient_list=[recipient_email],
                from_email=None
            )

def get_default_mail_sender() -> Callable[[str,str,str,dict], None]:
    func_from_settings = getattr(settings, "DEFAULT_TEMPLAITE_EMAIL_SENN_FUNCTION", None)
    result = send_email_from_template
    if func_from_settings:
        try:
            result = import_string(func_from_settings)
        except (ImportError, ModuleNotFoundError) as m:
            logger.warning(m)
    return result

default_template_mail_sender = get_default_mail_sender()
