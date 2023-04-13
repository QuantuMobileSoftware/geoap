from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.db import transaction

from user.models import User, Transaction


class UserForm(forms.ModelForm):
    top_up_balance = forms.DecimalField(label=_('Top up Balance'), max_digits=9, decimal_places=2, required=False)
    top_up_comment = forms.CharField(label=_('Top up Comment'), widget=forms.Textarea, required=False)
    default_comment = 'Balance replenishment'

    class Meta:
        model = User
        fields = '__all__'

    def save(self, commit=True):
        top_up_balance = self.cleaned_data.get('top_up_balance', None)
        top_up_comment = self.cleaned_data.get('top_up_comment', self.default_comment)

        with transaction.atomic():
            if top_up_balance:
                Transaction.objects.create(
                    user=self.instance,
                    amount=top_up_balance,
                    comment=top_up_comment or self.default_comment,
                    completed=True
                )
                self.instance.balance += top_up_balance
            return super().save(commit)


class UserAdmin(BaseUserAdmin):
    form = UserForm
    list_display = ('username', 'email', 'is_staff', 'is_active', 'is_superuser', 'area_limit_ha')
    fieldsets = (
        ('Personal', {'fields': ('username', 'first_name', 'last_name', 'email', 'area_limit_ha', 'planet_api_key')}),
        ('Billing', {'fields': ('balance', 'on_hold', 'discount')}),
        ('Top up', {'fields': ('top_up_balance', 'top_up_comment')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', )}),
        ('User permissions', {'fields': ('user_permissions', )}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    readonly_fields = ('balance',)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'area_limit_ha', 'password1', 'password2'),
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        readonly_fields = super().get_readonly_fields(request, obj)
        if obj and not request.user.has_perm("user.can_change_balance"):
            return readonly_fields + ('top_up_balance', 'top_up_comment')
        return readonly_fields


admin.site.register(User, UserAdmin)


@admin.register(Transaction)
class TransactionModel(admin.ModelAdmin):
    list_display = ('amount', 'user', 'request', 'created_at', 'completed')
    list_filter = ('created_at', 'completed', 'rolled_back')
    search_fields = ('user', 'request')
    readonly_fields = ('amount', 'user', 'request', 'created_at', 'updated_at')

    fieldsets = (
        (_('Transaction info'), {
            'fields': ('amount', 'user', 'request', 'comment', 'completed', 'rolled_back')
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
