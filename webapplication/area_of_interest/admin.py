from django.contrib.gis import admin
from .models import AoI


@admin.register(AoI)
class AoIAdmin(admin.OSMGeoAdmin):
    list_display = ('name', 'polygon', 'description', 'create_date',)
    search_fields = ('name', 'description')
    fieldsets = (('fieldsets_name', {
        'fields': ('name', 'polygon', 'description')
    }), )

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions
