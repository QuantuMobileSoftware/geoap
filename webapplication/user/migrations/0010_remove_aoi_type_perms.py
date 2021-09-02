from django.db import migrations

table_name = 'aoitype'
permissions_list = (f'view_{table_name}', f'add_{table_name}', f'change_{table_name}', f'delete_{table_name}')


def remove_client_group_permissions(apps, schema_editor):
    """
    Remove 'Can view AoiType'  permission for 'Client' group
    """
    group_model = apps.get_model("auth", "Group")
    db_alias = schema_editor.connection.alias
    
    group, _ = group_model.objects.using(db_alias).get_or_create(name="Client")
    group.permissions.filter(codename__in=permissions_list).delete()


def remove_ds_engineer_group_permissions(apps, schema_editor):
    """
    Remove 'Can view AoiType' permissions for 'Data_science_engineer' group
    """
    group_model = apps.get_model("auth", "Group")
    db_alias = schema_editor.connection.alias

    group, _ = group_model.objects.using(db_alias).get_or_create(name="Data_science_engineer")
    group.permissions.filter(codename__in=permissions_list).delete()
    

def remove_permissions(apps, schema_editor):
    """
    Remove permissions for AoiType model.
    :param apps:
    :param schema_editor:
    :return:
    """
    table_name = 'aoitype'
    permission = apps.get_model("auth", "Permission")
    db_alias = schema_editor.connection.alias
    permission.objects.using(db_alias).filter(codename__in=permissions_list).delete()
    
    
def delete_model_from_content_type(apps, schema_editor):
    content_type_model = apps.get_model('contenttypes', 'ContentType')
    db_alias = schema_editor.connection.alias

    content_type_model.objects.using(db_alias).get(model=table_name).delete()
    

class Migration(migrations.Migration):

    dependencies = [
        ('user', '0009_add_aoi_type_perms'),
    ]

    operations = [
        migrations.RunPython(remove_client_group_permissions),
        migrations.RunPython(remove_ds_engineer_group_permissions),
        migrations.RunPython(remove_permissions),
        migrations.RunPython(delete_model_from_content_type)
    ]
