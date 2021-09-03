from functools import reduce
from operator import or_
from rest_framework import filters
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from publisher.models import ACL


def filter_for_results_by_acl(restrict_projects_to):
    query = reduce(or_, (Q(filepath__istartswith=result_path) for result_path in restrict_projects_to)) & Q(
        request__isnull=True)
    return query


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
        try:
            acl = ACL.objects.get(user=request.user.id)
            if len(acl.restrict_projects_to) == 0:
                print('len ACL = 0')
                queryset = queryset.filter(Q(request__isnull=True) | Q(request__user__id=request.user.id))
                print(queryset)
                return queryset

            print(f'len ACL = {len(acl.restrict_projects_to)}')
            query = filter_for_results_by_acl(acl.restrict_projects_to)
            queryset = queryset.filter(query | Q(request__user__id=request.user.id))
            print(queryset)
            return queryset
        
        except ObjectDoesNotExist:
            print('ACL is None')
            queryset = queryset.filter(Q(request__isnull=True) | Q(request__user__id=request.user.id))
            print(queryset)
            return queryset
