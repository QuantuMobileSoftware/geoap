from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from transaction.models import Transaction


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

