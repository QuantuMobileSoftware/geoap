from django.contrib.gis import admin
from rangefilter.filter import DateRangeFilter

from .models import Result
from django.db.models import JSONField
from flat_json_widget.widgets import FlatJsonWidget


@admin.register(Result)
class ResultAdmin(admin.OSMGeoAdmin):

    list_display = ('filepath', 'name', 'layer_type', 'modifiedat', 'start_date', 'end_date', 'released', )
    list_filter = ('layer_type', ('start_date', DateRangeFilter), ('end_date', DateRangeFilter), 'released', )
    search_fields = ('filepath', 'name', 'description', 'options', )
    readonly_fields = ('filepath', 'layer_type', 'modifiedat', 'rel_url', )

    fieldsets = (
        ('Fill by Publisher', {
            'fields': ('filepath', 'layer_type', 'modifiedat', 'rel_url', 'polygon', )
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

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions
    
    def has_module_permission(self, request):
        if request.user.is_authenticated:
            return request.user.user_is_active_and_is_staff

    def has_view_permission(self, request, obj=None):
        if request.user.is_authenticated:
            return request.user.user_is_active_and_is_staff

    def has_change_permission(self, request, obj=None):
        if request.user.is_authenticated:
            return request.user.user_is_active_and_is_staff
