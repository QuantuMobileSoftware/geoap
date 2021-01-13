from rest_framework.permissions import DjangoModelPermissions, BasePermission


class ModelPermissions(DjangoModelPermissions):
    """
    The request is authenticated using `django.contrib.auth` permissions.
    """
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }
    
    
class IsOwnerPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user
