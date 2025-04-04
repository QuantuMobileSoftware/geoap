from django.contrib.gis import admin
from rangefilter.filter import DateRangeFilter

from .models import Result, ACL
from django.db.models import JSONField
from flat_json_widget.widgets import FlatJsonWidget


@admin.register(Result)
class ResultAdmin(admin.OSMGeoAdmin):
    list_display = ('filepath', 'name', 'layer_type', 'modifiedat', 'start_date', 'end_date', 'released', 'validated',
                    'validation_start_date', 'validation_end_date')
    list_filter = (
        'layer_type', ('start_date', DateRangeFilter), ('end_date', DateRangeFilter), 'released', 'validated')
    search_fields = ('filepath', 'name', 'description', 'options')
    readonly_fields = ('filepath', 'layer_type', 'modifiedat', 'rel_url', 'request', 'styles_url', 'labels', 'colormap',
                       'validation_start_date', 'validation_end_date')

    fieldsets = (
        ('Fill by Publisher', {
            'fields': ('filepath', 'layer_type', 'modifiedat', 'rel_url', 'request', 'bounding_polygon', 'styles_url',
                       'labels')
        }),
        ('Fill by Data Scientist', {
            'fields': (
                'name', 'options', 'description', 'start_date', 'end_date', 'released', 'to_be_deleted', 'validated',
                'validation_start_date', 'validation_end_date')
        }),
    )

    formfield_overrides = {
        JSONField: {
            'widget': FlatJsonWidget,
        },
    }


@admin.register(ACL)
class ACLAdmin(admin.OSMGeoAdmin):
    list_display = ('user', 'restrict_projects_to',)
    list_filter = ('user', 'restrict_projects_to',)
    search_fields = ('restrict_projects_to',)
