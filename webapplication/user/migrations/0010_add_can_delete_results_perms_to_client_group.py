from django.db import migrations


def add_can_delete_results_perms_to_client_group(apps, schema_editor):
    group_model = apps.get_model("auth", "Group")
    permission_model = apps.get_model("auth", "Permission")
    
    db_alias = schema_editor.connection.alias
    group = group_model.objects.using(db_alias).get(name="Client")
    permission = permission_model.objects.using(db_alias).get(codename="delete_result")
    group.permissions.add(permission)


class Migration(migrations.Migration):
    dependencies = [
        ('user', '0009_add_aoi_type_perms'),
        ('publisher', '0017_result_styles_url')
    ]

    operations = [
        migrations.RunPython(add_can_delete_results_perms_to_client_group),
    ]
