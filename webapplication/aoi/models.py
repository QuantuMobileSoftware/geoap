from django.contrib.gis.db import models
from django.utils import timezone
from user.models import User


class AoI(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='User', related_name='aoi')
    name = models.CharField(max_length=200, blank=False, null=False, unique=True, verbose_name='Aoi name')
    polygon = models.PolygonField(spatial_index=True, verbose_name='Polygon')
    createdat = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Area of interest'
        verbose_name_plural = 'Areas of interest'
        ordering = ['name']
        
        
class JupyterNotebook(models.Model):
    name = models.CharField(max_length=200, blank=False, null=False, unique=True, verbose_name='Jupyter Notebook name')
    image = models.CharField(max_length=400, verbose_name='Image')
    path_to_a_notebook = models.CharField(max_length=200, unique=True, verbose_name='Path to a notebook')
    kernel_name = models.CharField(max_length=200, null=True, blank=True, verbose_name='Kernel name')
    is_validated = models.BooleanField(default=False, verbose_name='Is validated')
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Jupyter Notebook'
        verbose_name_plural = 'Jupyter Notebooks'
        ordering = ['name']
        
        
class Request(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='User name')
    aoi_id = models.ForeignKey(AoI, on_delete=models.PROTECT, verbose_name='Aoi name')
    jupyter_notebook_id = models.ForeignKey(
        JupyterNotebook, on_delete=models.PROTECT,
        verbose_name='Jupyter notebook name'
    )
    date_from = models.DateField(blank=True, null=True, verbose_name='Date from')
    date_to = models.DateField(blank=True, null=True, verbose_name='Date to')
    started_at = models.DateTimeField(blank=True, null=True, verbose_name='Started at')
    finished_at = models.DateTimeField(blank=True, null=True, verbose_name='Finished at')
    error = models.CharField(max_length=400, blank=True, null=True, verbose_name='Error')

    @property
    def jupyter_notebook_name(self):
        return self.jupyter_notebook_id.name
