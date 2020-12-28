from django.contrib.gis import admin
from rangefilter.filter import DateRangeFilter

from .models import Result, ACL
from django.db.models import JSONField
from flat_json_widget.widgets import FlatJsonWidget


@admin.register(Result)
class ResultAdmin(admin.OSMGeoAdmin):

    list_display = ('filepath', 'name', 'layer_type', 'modifiedat', 'start_date', 'end_date', 'released', 'styles_url')
    list_filter = ('layer_type', ('start_date', DateRangeFilter), ('end_date', DateRangeFilter), 'released', )
    search_fields = ('filepath', 'name', 'description', 'options', 'styles_url')
    readonly_fields = ('filepath', 'layer_type', 'modifiedat', 'rel_url', 'styles_url')

    fieldsets = (
        ('Fill by Publisher', {
            'fields': ('filepath', 'layer_type', 'modifiedat', 'rel_url', 'bounding_polygon', 'styles_url')
        }),
        ('Fill by Data Scientist', {
            'fields': ('name', 'options', 'description', 'start_date', 'end_date', 'released', 'to_be_deleted')
        }),
    )

    formfield_overrides = {
        JSONField: {
            'widget': FlatJsonWidget,
        },
    }


@admin.register(ACL)
class ACLAdmin(admin.OSMGeoAdmin):
    list_display = ('user_id', 'restrict_projects_to')
    list_filter = ('user_id', 'restrict_projects_to')
    search_fields = ('restrict_projects_to', )
