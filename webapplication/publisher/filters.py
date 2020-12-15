from functools import reduce
from operator import or_
from rest_framework import filters
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from publisher.models import ACL


def filter_for_results_by_acl(restrict_projects_to):
    return reduce(or_, (Q(filepath__istartswith=result_path) for result_path in restrict_projects_to))


class ResultsByACLFilterBackend(filters.BaseFilterBackend):
    """
    Filter that only allows users to see Result objects if Result.filepath starts with any of items stored in
    ACL.restrict_projects_to field and ACL.user_id == request.user.id,
    or
    request.user.id not in ACL table,
    or
    record from ACL table where ACL.user_id == request.user.id has empty  restrict_projects_to field
    """
    def filter_queryset(self, request, queryset, view):
        try:
            acl = ACL.objects.get(user_id=request.user.id)
            if len(acl.restrict_projects_to) == 0:
                return queryset.all()

            query = filter_for_results_by_acl(acl.restrict_projects_to)
            return queryset.filter(query)
        
        except ObjectDoesNotExist:
            return queryset.all()
