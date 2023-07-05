from django.utils import timezone
from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.geos import GEOSGeometry
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from django.core.validators import MaxValueValidator

from aoi.models import AoI, Request


class User(AbstractUser):
    area_limit_ha = models.IntegerField(null=True, default=None, blank=True)
    planet_api_key = models.CharField(max_length=64, verbose_name='Planet API Key', null=True, default=None, blank=True)
    balance = models.DecimalField(_('Balance'), max_digits=9, decimal_places=2, default=0, null=True, blank=True)
    on_hold = models.DecimalField(_("On hold"), max_digits=9, decimal_places=2, default=0, null=True, blank=True)
    discount = models.PositiveIntegerField(_("Discount"), null=True, blank=True, default=0,
                                           validators=(MaxValueValidator(100),))
    trial_started_at = models.DateTimeField(blank=True, null=True, verbose_name='Trial started at')
    trial_finished_at = models.DateTimeField(blank=True, null=True, verbose_name='Trial finished at')
    is_trial_end_notified = models.BooleanField(default=False, verbose_name='Is trial end notified')
    receive_notification = models.BooleanField(default=True, verbose_name='Receive Notification')


    class Meta:
        permissions = (
            ("can_change_balance", "Can change balance"),
        )

    @property
    def areas_total_ha(self):
        total = 0
        polygon_union = AoI.objects.filter(user=self).values('id', 'polygon')
        for record in polygon_union:
            # EPSG:4326 has degree units
            # EPSG:8857 has metre units
            # we need to convert EPSG:4326 to EPSG:8857
            record['polygon'].transform(8857)
            total = total + record['polygon'].area / 10000
        return total
    
    def can_add_new_area(self, polygon_str):
        if not self.area_limit_ha:
            return True
        polygon = GEOSGeometry(polygon_str, srid=4326)
        polygon.transform(8857)
        if (polygon.area / 10000 + self.areas_total_ha) > self.area_limit_ha:
            return False
        return True
    
    def can_update_area(self, aoi_id, polygon_str):
        if not self.area_limit_ha:
            return True
        polygon = GEOSGeometry(polygon_str, srid=4326)
        polygon.transform(8857)
        new_area_ha = polygon.area / 10000
        
        aoi = AoI.objects.get(id=aoi_id)
        aoi_polygon = aoi.polygon
        aoi_polygon.transform(8857)
        old_area_ha = aoi_polygon.area / 10000
        
        if self.areas_total_ha - old_area_ha + new_area_ha > self.area_limit_ha:
            return False
        return True

    @property
    def actual_balance(self):
        return self.balance - self.on_hold

    def finish_trial (self):
        self.trial_finished_at=timezone.now()
        self.top_up_balance(-self.balance, settings.TRIAL_PERIOD_FINISH_COMMENT)
        self.save(update_fields=("trial_finished_at",))

    def start_trial (self):
        self.top_up_balance(settings.TRIAL_PERIOD_BALANCE, settings.TRIAL_PERIOD_START_COMMENT)
        self.trial_started_at=timezone.now()
        self.save(update_fields=("trial_started_at",))
        
    def top_up_balance(self, amount, comment):
        if self.trial_started_at and not self.trial_finished_at:
            self.finish_trial()

        with transaction.atomic():
            Transaction.objects.create(
                user=self,
                amount=amount,
                comment=comment,
                completed=True
            )
            self.balance += amount
        self.save(update_fields=("balance",))


class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="transactions")
    amount = models.DecimalField(_("Amount"), max_digits=9, decimal_places=2)
    created_at = models.DateTimeField(_("Created at"), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_("Updated at"), auto_now=True)
    request = models.ForeignKey(Request, on_delete=models.PROTECT, default=None, blank=True, null=True,
                                related_name="transactions")
    comment = models.TextField(_("Comment"), blank=True, default="")
    error = models.CharField(max_length=400, blank=True, null=True, verbose_name='Error')
    completed = models.BooleanField(_("Completed"), default=False, blank=True, null=True)
    rolled_back = models.BooleanField(_("Rolled back"), default=False, blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")
        permissions = (
            ("view_all_transactions", "Can view all transactions"),
        )

    @staticmethod
    def generate_error(errors):
        if errors:
            return f" Errors: {', '.join([error for error in errors])}."
        else:
            return settings.DEFAULT_TRANSACTION_ERROR

