from django.contrib.admin.widgets import FilteredSelectMultiple, AdminTextareaWidget
from django import forms

from .models import (
    Component, 
    Input, 
    Output
)

class ComponentAdminForm(forms.ModelForm):
    """Form to use FilteredSelectMultiple and AdminTextareaWidget widgets in admin"""

    command = forms.CharField(
        required=False,
        widget=AdminTextareaWidget()
    )

    inputs = forms.ModelMultipleChoiceField(
        required=False,
        queryset=Input.objects.all(),
        widget=FilteredSelectMultiple('Inputs', is_stacked=False)
    )
    outputs = forms.ModelMultipleChoiceField(
        required=False,
        queryset=Output.objects.all(),
        widget=FilteredSelectMultiple('Inputs', is_stacked=False)
    )

    class Media:
        css = {'all':('/admin/css/widgets.css', 'admin/css/overrides.css'),}
        js = ('/admin/jquery.js','/admin/jsi18n/')

    class Meta:
        fields = '__all__'
        model = Component