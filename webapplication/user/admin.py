from django import forms
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.db import transaction

from user.models import User, Transaction


class UserForm(forms.ModelForm):
    top_up_balance = forms.DecimalField(label=_('Top up Balance'), max_digits=9, decimal_places=2, required=False)
    top_up_comment = forms.CharField(label=_('Top up Comment'), widget=forms.Textarea, required=False)

    class Meta:
        model = User
        fields = '__all__'

    def save(self, commit=True):
        top_up_balance = self.cleaned_data.get('top_up_balance', None)
        top_up_comment = self.cleaned_data.get('top_up_comment', '')
        with transaction.atomic():
            if 'balance' in self.changed_data:
                Transaction.objects.create(
                    user=self.instance,
                    amount=self.cleaned_data.get('balance') - self.initial.get('balance'),
                    completed=True
                )
            if top_up_balance:
                Transaction.objects.create(
                    user=self.instance,
                    amount=top_up_balance,
                    comment=top_up_comment,
                    completed=True
                )
                self.instance.balance += top_up_balance
            return super().save(commit)


class UserAdmin(BaseUserAdmin):
    form = UserForm
    list_display = ('username', 'is_staff', 'is_active', 'is_superuser', 'area_limit_ha')
    fieldsets = (
        ('Personal', {'fields': ('username', 'first_name', 'last_name', 'email', 'area_limit_ha', 'planet_api_key')}),
        ('Billing', {'fields': ('balance', 'on_hold', 'discount')}),
        ('Top up user', {'fields': ('top_up_balance', 'top_up_comment')}),
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
    readonly_fields = ('amount', 'user', 'request', 'created_at', 'updated_at')

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
