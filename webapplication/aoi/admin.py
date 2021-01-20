from django.contrib.gis import admin
from .models import AoI, JupyterNotebook, Request


@admin.register(AoI)
class AoIAdmin(admin.OSMGeoAdmin):
    list_display = ('user', 'name', 'polygon', 'createdat', )
    search_fields = ('name',)
    fieldsets = (('fieldsets_name', {
        'fields': ('user_id', 'name', 'polygon')
    }), )


@admin.register(JupyterNotebook)
class JupyterNotebookAdmin(admin.OSMGeoAdmin):
    list_display = ('name', 'image', 'path_to_a_notebook', 'kernel_name', 'is_validated')
    search_fields = ('name', 'path_to_a_notebook', 'kernel_name', 'is_validated')


@admin.register(Request)
class RequestAdmin(admin.OSMGeoAdmin):
    list_display = ('user_id', 'aoi_id', 'jupyter_notebook_id', 'date_from', 'date_to', 'started_at', 'finished_at',
                    'error')
