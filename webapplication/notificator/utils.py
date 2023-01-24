from notificator.models import Email


def send_email_from_template_async(template: str, recipient_email:str, subject:str, context: dict):
        msg = Email(
            template=template,
            recipient_email=recipient_email,
            subject=subject,
            context=context
        )
        msg.save()