from django.contrib.gis import admin
from .forms import ComponentAdminForm
from .models import (
    AoI,
    JupyterNotebook,
    Request,
    Component,
    Input,
    Output
)  
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
    list_display = ('pk', 'name', 'image', 'path', 'kernel_name', 'run_validation', 'success', 'options',
                    'additional_parameter', 'period_required',)
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
                    'calculated', 'success', 'error', 'additional_parameter')
    readonly_fields = ['pk', 'started_at', 'calculated', 'error', ]


@admin.register(Component)
class ComponentAdmin(admin.OSMGeoAdmin):
    form = ComponentAdminForm
    list_display = ('pk', 'name', 'image', 'command', 'require_GPU', 'run_validation', 'success')
    search_fields = ('name', 'image', )
    readonly_fields = ('pk', 'run_validation', 'success', )
    list_filter = ('require_GPU', 'run_validation', 'success', 'inputs__name', )


@admin.register(Input)
class InputAdmin(admin.OSMGeoAdmin):
    list_display = ('pk', 'name', 'type', 'assigned_from', 'is_file',)
    search_fields = ('name', )
    readonly_fields = ('pk',)
    list_filter = ('type', 'assigned_from','is_file', )

@admin.register(Output)
class OutputAdmin(admin.OSMGeoAdmin):
    list_display=('pk', 'name', 'is_error')
    search_fields = ('name', )
    readonly_fields = ('pk',)
    list_filter = ('is_error', )

