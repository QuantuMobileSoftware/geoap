from functools import reduce
from operator import or_
from rest_framework import filters
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from publisher.models import ACL
from aoi.models import Request


def filter_for_results_by_acl(restrict_projects_to):
    return reduce(or_, (Q(filepath__istartswith=result_path) for result_path in restrict_projects_to))


class ResultsByACLFilterBackend(filters.BaseFilterBackend):
    """
    Filter that only allows users to see Result objects if Result.filepath starts with any of items stored in
    ACL.restrict_projects_to field and ACL.user == request.user.id,
    or
    request.user.id not in ACL table,
    or
    record from ACL table where ACL.user == request.user.id has empty  restrict_projects_to field
    """
    def filter_queryset(self, request, queryset, view):
        user_requests = Request.objects.filter(user_id=request.user.id)
        user_requests_list = user_requests.values_list('id', flat=True)

        user_requests_filter = Q(request_id__in=user_requests_list)
        is_null_filter = Q(request_id__isnull=True)
        filtered_queryset = queryset.filter(user_requests_filter)
        if not filtered_queryset.exists():
             filtered_queryset = queryset.filter(is_null_filter)

        try:
            acl = ACL.objects.get(user=request.user.id)
            if len(acl.restrict_projects_to) == 0:
                return filtered_queryset
            query = filter_for_results_by_acl(acl.restrict_projects_to)
            return queryset.filter(query)
        
        except ObjectDoesNotExist:
            return filtered_queryset
