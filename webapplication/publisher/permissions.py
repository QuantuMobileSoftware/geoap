from rest_framework.permissions import BasePermission
from django.core.exceptions import ObjectDoesNotExist
from .models import ACL


class ResultByACLPermission(BasePermission):
    
    def has_object_permission(self, request, view, obj):
        try:
            acl = ACL.objects.get(user=request.user.id)
            if len(acl.restrict_projects_to) == 0:
                return True
            for item in acl.restrict_projects_to:
                if str(obj.filepath).upper().startswith(item):
                    return True
            return False
        except ObjectDoesNotExist:
            return True
