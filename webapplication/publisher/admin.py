from django.contrib.gis import admin
from rangefilter.filter import DateRangeFilter

from .models import Result, ACL
from django.db.models import JSONField
from flat_json_widget.widgets import FlatJsonWidget


@admin.register(Result)
class ResultAdmin(admin.OSMGeoAdmin):

    list_display = ('filepath', 'name', 'layer_type', 'modifiedat', 'start_date', 'end_date', 'released',
                    'to_be_deleted')
    list_filter = ('layer_type', ('start_date', DateRangeFilter), ('end_date', DateRangeFilter), 'released', )
    search_fields = ('filepath', 'name', 'description', 'options', )
    readonly_fields = ('filepath', 'layer_type', 'modifiedat', 'rel_url', )

    fieldsets = (
        ('Fill by Publisher', {
            'fields': ('filepath', 'layer_type', 'modifiedat', 'rel_url', 'bounding_polygon', )
        }),
        ('Fill by Data Scientist', {
            'fields': ('name', 'options', 'description', 'start_date', 'end_date', 'released', )
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
