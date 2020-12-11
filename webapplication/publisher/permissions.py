from rest_framework.permissions import BasePermission
from django.core.exceptions import ObjectDoesNotExist
from .models import ACL, Result
from .filters import filter_for_results_by_acl


class ResultPermission(BasePermission):
    
    def has_object_permission(self, request, view, obj):
        try:
            acl = ACL.objects.get(user_id=request.user.id)
            if len(acl.restrict_projects_to) == 0:
                return True
            
            query = filter_for_results_by_acl(acl.restrict_projects_to)

            if obj in Result.objects.filter(query):
                return True
            return False
        except ObjectDoesNotExist:
            return True
