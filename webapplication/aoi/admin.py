from django.contrib.gis import admin
from .models import AoI, JupyterNotebook, Request
from django.db.models import JSONField
from flat_json_widget.widgets import FlatJsonWidget


@admin.register(AoI)
class AoIAdmin(admin.OSMGeoAdmin):
    list_display = ('user', 'name', 'polygon', 'createdat', 'type')
    search_fields = ('name', 'type')
    fieldsets = (('fieldsets_name', {
        'fields': ('user', 'name', 'polygon', 'type')
    }),)


@admin.register(JupyterNotebook)
class JupyterNotebookAdmin(admin.OSMGeoAdmin):
    list_display = ('pk', 'name', 'image', 'path', 'kernel_name', 'run_validation', 'success', 'options', )
    search_fields = ('name', 'image', 'path', 'kernel_name', 'run_validation', 'success', )
    readonly_fields = ('pk', 'run_validation', 'success', )

    formfield_overrides = {
        JSONField: {
            'widget': FlatJsonWidget,
        },
    }


@admin.register(Request)
class RequestAdmin(admin.OSMGeoAdmin):
    list_display = ('pk', 'user', 'aoi', 'notebook', 'date_from', 'date_to', 'started_at', 'finished_at',
                    'calculated', 'success', 'error', )
    readonly_fields = ['pk', 'started_at', 'finished_at', 'calculated', 'error', ]

    def get_readonly_fields(self, request, obj=None):
        if obj and 'success' not in self.readonly_fields and not obj.calculated:
            self.readonly_fields.append('success')
        return self.readonly_fields
