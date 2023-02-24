from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.db import transaction

from user.models import User, Transaction


class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'is_staff', 'is_active', 'is_superuser', 'area_limit_ha')
    fieldsets = (
        ('Personal', {'fields': ('username', 'first_name', 'last_name', 'email', 'area_limit_ha', 'planet_api_key')}),
        ('Billing', {'fields': ('balance', 'on_hold', 'discount')}),
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


@admin.register(Transaction)
class TransactionModel(admin.ModelAdmin):
    list_display = ('amount', 'user', 'request', 'created_at', 'completed')
    list_filter = ('created_at', 'completed')
    search_fields = ('user', 'request')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (_('Transaction info'), {
            'fields': ('amount', 'user', 'request', 'comment', 'completed')
        }),
        (_('Important dates'), {
            'classes': ('collapse',),
            'fields': (('created_at', 'updated_at',),)
        })
    )
    raw_id_fields = ("user", "request")
    add_fieldsets = (
        (_('Transaction info'), {
            'fields': ('amount', 'user', 'request', 'comment', 'completed')
        }),
    )

    def top_up_user_balance(self, request, obj):
        with transaction.atomic():
            is_updated = obj.user.top_up_balance(obj.amount)
            if is_updated:
                obj.completed = True
                obj.save(update_fields=("completed",))
            else:
                messages.error(request, _("Error caused in user balance top up!"))

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not change:
            self.top_up_user_balance(request, obj)
