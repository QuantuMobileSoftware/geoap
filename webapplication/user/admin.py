from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


from .models import User


class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'is_staff', 'is_active', 'is_superuser', 'area_limit_ha')
    fieldsets = (
        ('Personal', {'fields': ('username', 'first_name', 'last_name', 'email', 'area_limit_ha')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', )}),
        ('User permissions', {'fields': ('user_permissions', )}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'area_limit_ha', 'password1', 'password2'),
        }),
    )


admin.site.register(User, UserAdmin)
