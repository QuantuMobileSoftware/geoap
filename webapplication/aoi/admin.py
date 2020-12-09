from django.contrib.gis import admin
from .models import AoI


@admin.register(AoI)
class AoIAdmin(admin.OSMGeoAdmin):
    list_display = ('name', 'polygon', 'createdat')
    search_fields = ('name',)
    fieldsets = (('fieldsets_name', {
        'fields': ('name', 'polygon')
    }), )
