from decimal import Decimal

from django.contrib.gis.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from django.conf import settings


class AoI(models.Model):
    USER_DEFINED_TYPE = 1
    FIELD_TYPE = 2
    AREA_TYPE_CHOICES = (
        (USER_DEFINED_TYPE, 'AREA'),
        (FIELD_TYPE, 'FIELD')
    )

    user = models.ForeignKey('user.User', on_delete=models.CASCADE, verbose_name='User id', related_name='aoi')
    name = models.CharField(max_length=200, blank=False, null=False, verbose_name='AOI name')
    polygon = models.PolygonField(spatial_index=True, verbose_name='Polygon')
    createdat = models.DateTimeField(default=timezone.now)
    type = models.IntegerField(choices=AREA_TYPE_CHOICES, default=USER_DEFINED_TYPE)
    sentinel_hub_available_dates = models.JSONField(blank=True, null=True, verbose_name='Available dates from Sentinel Hub')
    sentinel_hub_available_dates_update_time = models.DateTimeField(default=None, null=True, verbose_name='Sentinel Hub available dates update time')


    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Area of interest'
        verbose_name_plural = 'Areas of interest'
        ordering = ['name']
        unique_together = ('user', 'name')

    @staticmethod
    def polygon_in_sq_km(polygon):
        # EPSG:4326 has degree units
        # EPSG:8857 has metre units
        # we need to convert EPSG:4326 to EPSG:8857
        polygon_copy = polygon.transform(8857, clone=True)
        return Decimal(polygon_copy.area) / 1_000_000

    @property
    def area_in_sq_km(self) -> Decimal:
        return self.polygon_in_sq_km(self.polygon)


class Component(models.Model):
    DATE_YEAR_TYPE = 1
    DATE_RANGE_TYPE = 2
    DATE_SEASON_TYPE = 3
    DATE_DAY_TYPE = 4
    DATE_TYPE_CHOICES = (
        (DATE_YEAR_TYPE, "YEAR"),
        (DATE_RANGE_TYPE, "DATE RANGE"),
        (DATE_SEASON_TYPE, "SEASON"),
        (DATE_DAY_TYPE, "DAY")
    )

    name = models.CharField(max_length=200, blank=False, null=False, unique=True, verbose_name='Component name')
    basic_price = models.DecimalField(_("Basic Price (per 1.sq.km)"), max_digits=9, decimal_places=2, default=0)
    image = models.CharField(max_length=400, verbose_name='Docker Image')
    command = models.CharField(max_length=400, blank=True, null=True, verbose_name="Command")
    description = models.CharField(max_length=400, blank=True, null=True, verbose_name="Description")
    domains = ArrayField(models.CharField(max_length=15), size=8, blank=True, verbose_name="Domains", null=True)
    description_picture = models.ImageField(upload_to=settings.COMPONENT_DESCRIPTION_PICTURE_MEDIA_PATH, blank=True, null=True, verbose_name="Description picture")
    notebook_path = models.CharField(max_length=200, unique=True, blank=True, null=True,
                                     verbose_name='Path to a notebook')
    kernel_name = models.CharField(max_length=200, null=True, blank=True, verbose_name='Kernel name')
    run_validation = models.BooleanField(default=False, verbose_name='Run validation')
    success = models.BooleanField(default=False, verbose_name='Validation succeeded')
    additional_parameter = models.CharField(max_length=50, null=True, blank=True, verbose_name='Additional parameter')
    run_on_gpu = models.BooleanField(default=True, verbose_name='Whether GPU is needed for a component to run')
    period_required = models.BooleanField(default=True, verbose_name='Start and end dates are required')
    planet_api_key_required = models.BooleanField(default=False, verbose_name='Planet API key is required')
    sentinel_google_api_key_required = models.BooleanField(default=False,
                                                           verbose_name='Sentinel Google API key is required')
    sentinel1_aws_creds_required = models.BooleanField(default=False,
                                                       verbose_name='Sentinel 1 AWS credentials are required')
    scihub_creds_required = models.BooleanField(default=False,
                                                verbose_name='Copernicus Open Access Hub credentials are required')
    date_type = models.IntegerField(choices=DATE_TYPE_CHOICES, default=DATE_RANGE_TYPE)
    geoap_creds_required = models.BooleanField(default=False,
                                                           verbose_name='Geoap creds is required')

    def __str__(self):
        return self.name

    @property
    def is_notebook(self):
        return not bool(self.command) and (bool(self.notebook_path) and bool(self.kernel_name))

    @property
    def validated(self):
        return (self.run_validation and self.success)

    class Meta:
        verbose_name = 'Component'
        verbose_name_plural = 'Components'
        ordering = ['name']

    def calculate_request_price(self, area: Decimal, user) -> Decimal:
        """
        Request price = Area (in sq.km, rounded up) * Product basic price * (1-User Personal discount).
        Format XX.XX
        """
        return round(area * self.basic_price * (1 - user.discount), 2)


class Request(models.Model):
    user = models.ForeignKey('user.User', on_delete=models.PROTECT, verbose_name='User id')
    aoi = models.ForeignKey(AoI, null=True, on_delete=models.SET_NULL, verbose_name='AOI id')
    component = models.ForeignKey(
        Component, on_delete=models.PROTECT,
        verbose_name='Component id',
    )
    date_from = models.DateField(blank=True, null=True, verbose_name='Date from')
    date_to = models.DateField(blank=True, null=True, verbose_name='Date to')
    started_at = models.DateTimeField(blank=True, null=True, verbose_name='Started at')
    finished_at = models.DateTimeField(blank=True, null=True, verbose_name='Finished at')
    calculated = models.BooleanField(default=False, verbose_name='Notebook calculated')
    success = models.BooleanField(default=False, verbose_name='Execution succeeded')
    error = models.CharField(max_length=400, blank=True, null=True, verbose_name='Error')
    user_readable_errors = ArrayField(models.CharField(max_length=250), blank=True, null=True, verbose_name='User-readable errors')
    polygon = models.PolygonField(spatial_index=True, verbose_name='Polygon')
    additional_parameter = models.CharField(max_length=50, null=True, blank=True, verbose_name='Additional parameter')
    request_origin = models.CharField(max_length=50, default="https://portal.soilmate.ai/", verbose_name='Request origin')

    @property
    def component_name(self):
        return self.component.name


class TransactionErrorMessage(models.Model):
    user_readable_error = models.CharField(max_length=400, blank=True, null=True, verbose_name='User-readable Error Message')
    original_component_error = models.CharField(max_length=400, blank=True, null=True, unique=True, verbose_name='Original component "error" example')
