from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from user.models import User


class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active', 'is_superuser', 'area_limit_ha', 'receive_news')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'receive_news')
    fieldsets = (
        ('Personal', {'fields': ('username', 'first_name', 'last_name', 'email', 'area_limit_ha', 'planet_api_key', 'receive_notification')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', )}),
        ('User permissions', {'fields': ('user_permissions', )}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Email notification', {'fields': ('receive_news', )}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'area_limit_ha', 'password1', 'password2'),
        }),
    )


admin.site.register(User, UserAdmin)

