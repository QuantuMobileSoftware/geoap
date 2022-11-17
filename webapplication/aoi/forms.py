from django import forms
from .models import Component

class ComponentAdminForm(forms.ModelForm):

    class Meta:
        model = Component
        fields = '__all__'
        widgets = {
            'command': forms.Textarea()
        }
