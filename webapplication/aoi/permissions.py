from rest_framework.permissions import BasePermission


class AoIIsOwnerPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsAdminUserOverride(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff
