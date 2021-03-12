from django.contrib.gis import admin
from .models import AoI, JupyterNotebook, Request
from django.db.models import JSONField
from flat_json_widget.widgets import FlatJsonWidget


@admin.register(AoI)
class AoIAdmin(admin.OSMGeoAdmin):
    list_display = ('user', 'name', 'polygon', 'createdat', )
    search_fields = ('name',)
    fieldsets = (('fieldsets_name', {
        'fields': ('user', 'name', 'polygon', )
    }),)


@admin.register(JupyterNotebook)
class JupyterNotebookAdmin(admin.OSMGeoAdmin):
    list_display = ('pk', 'name', 'image', 'path', 'kernel_name', 'is_validated', 'options',)
    search_fields = ('name', 'path', 'kernel_name', 'is_validated', 'options',)
    readonly_fields = ('pk',)

    formfield_overrides = {
        JSONField: {
            'widget': FlatJsonWidget,
        },
    }


@admin.register(Request)
class RequestAdmin(admin.OSMGeoAdmin):
    list_display = ('pk', 'user', 'aoi', 'notebook', 'date_from', 'date_to', 'started_at', 'finished_at',
                    'calculated', 'success', 'error', )
    readonly_fields = ('pk', 'started_at', 'finished_at', 'calculated', 'success', 'error', )
