from django.contrib.gis import admin
from .models import AoI, Component, Request, TransactionErrorMessage
from .forms import ComponentAdminForm


@admin.register(AoI)
class AoIAdmin(admin.OSMGeoAdmin):
    list_display = ('user', 'name', 'polygon', 'createdat', 'type')
    search_fields = ('name', 'type')
    fieldsets = (('fieldsets_name', {
        'fields': ('user', 'name', 'polygon', 'type')
    }),)


@admin.register(Component)
class ComponentAdmin(admin.OSMGeoAdmin):
    list_display = ('pk', 'name', 'basic_price', 'image', 'notebook_path', 'kernel_name', 'run_validation', 'success',
                    'additional_parameter', 'period_required',)
    search_fields = ('name', 'image', 'path', 'kernel_name', 'run_validation', 'success', )
    readonly_fields = ('pk',)

    form = ComponentAdminForm


@admin.register(Request)
class RequestAdmin(admin.OSMGeoAdmin):
    list_display = ('pk', 'user', 'aoi', 'component', 'date_from', 'date_to', 'started_at', 'finished_at',
                    'calculated', 'success', 'error', 'additional_parameter', 'user_readable_errors')
    readonly_fields = ['pk', 'started_at', 'calculated', 'error', ]



@admin.register(TransactionErrorMessage)
class TransactionErrorMessageAdmin(admin.OSMGeoAdmin):
    list_display = ('user_readable_error', 'original_component_error')
    readonly_fields = []