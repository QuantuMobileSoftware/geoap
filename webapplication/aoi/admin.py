from django.contrib.gis import admin
from .models import AoI


@admin.register(AoI)
class AoIAdmin(admin.OSMGeoAdmin):
    list_display = ('name', 'polygon', 'createdat')
    search_fields = ('name',)
    fieldsets = (('fieldsets_name', {
        'fields': ('name', 'polygon')
    }), )

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

    def has_add_permission(self, request):
        if request.user.is_authenticated:
            return request.user.user_is_active_and_is_staff

    def has_delete_permission(self, request, obj=None):
        if request.user.is_authenticated:
            return request.user.user_is_active_and_is_staff
