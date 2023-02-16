from django.db import models
from django.utils.translation import gettext_lazy as _

from aoi.models import Request
from user.models import User


class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="transactions")
    amount = models.DecimalField(_("Amount"), max_digits=9, decimal_places=2)
    created_at = models.DateTimeField(_("Created at"), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_("Updated at"), auto_now=True)
    request = models.ForeignKey(Request, on_delete=models.SET_NULL, default=None, blank=True, null=True,
                                related_name="transactions")
    comment = models.TextField(_("Comment"), blank=True, default="")
    completed = models.BooleanField(_("Completed"), default=False, blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")
