from django.contrib import admin

from devices.models import Camera


@admin.register(Camera)
class CameraAdmin(admin.ModelAdmin):
    list_display = ('cam_serial_num', 'user', 'created_at')
    list_filter = ('user',)
    search_fields = ('cam_serial_num', 'user__username')
    readonly_fields = ('created_at',)
    raw_id_fields = ('user',)
