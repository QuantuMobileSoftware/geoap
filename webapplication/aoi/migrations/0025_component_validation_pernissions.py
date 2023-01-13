# Generated by Django 3.1 on 2022-11-25 17:18

from django.db import migrations

def add_permissions(apps, schema_editor):
    """
    Add permissions for JupyterNotebook model.
    :param apps:
    :param schema_editor:
    :return:
    """
    permission = apps.get_model("auth", "Permission")
    content_type = apps.get_model("contenttypes", "ContentType")
    
    component_def = apps.get_model("aoi", "Component")
    
    # Content type objects
    component_def_content_type = content_type.objects.get_for_model(component_def)
    
    db_alias = schema_editor.connection.alias
    
    permissions_data = [
        {"codename": "can_run_not_validated", "name": "Can run requests with not validated components", "content_type": component_def_content_type},
    ]
    
    permission_list = []
    for permission_data in permissions_data:
        if not permission.objects.filter(codename=permission_data["codename"]).exists():
            permission_list.append(permission(codename=permission_data["codename"], name=permission_data["name"],
                                              content_type=permission_data["content_type"]))
    permission.objects.using(db_alias).bulk_create(permission_list)

def update_ds_engineer_group_permissions(apps, schema_editor):
    """
    Add 'view_component', 'delete_component', 'add_component', 'change_component'
    permission for 'Data_science_engineer' group
    """
    permission_model = apps.get_model('auth', 'Permission')
    group_model = apps.get_model("auth", "Group")
    
    db_alias = schema_editor.connection.alias
    
    group, _ = group_model.objects.using(db_alias).get_or_create(name="Data_science_engineer")
    group.permissions.add(permission_model.objects.using(db_alias).get(codename="can_run_not_validated"))

class Migration(migrations.Migration):

    dependencies = [
        ('aoi', '0024_make_change_in_component'),
    ]

    operations = [
        migrations.RunPython(add_permissions),
        migrations.RunPython(update_ds_engineer_group_permissions),
    ]