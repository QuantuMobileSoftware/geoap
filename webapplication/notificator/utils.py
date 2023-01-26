from notificator.models import Email


def send_email_from_template_async(template: str, recipient_email:str, subject:str=None, context: dict=None):
    """Push an Email to a queue - table in database, associated with Email class

    Args:
        template (str): name of a Django template
        recipient_email (str): destination email address 
        subject (str): subject of the letter
        context (dict): dictionary of data to fill template and make an email
    """
    msg = Email(
        template=template,
        recipient_email=recipient_email,
        subject=subject,
        context=context
    )
    msg.save()
