from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework import status
from django.http import HttpResponse
from .models import Result
from .serializers import ResultSerializer
from .filters import ResultsByACLFilterBackend
from .permissions import ResultByACLPermission
from user.permissions import ModelPermissions
from user.authentication import TokenAuthenticationWithQueryString


class FilesView(APIView):
    """
    Get files from local storage.
    """
    authentication_classes = [SessionAuthentication, TokenAuthenticationWithQueryString, BasicAuthentication]
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs) -> HttpResponse:
        """
        The parts are then rebuilt by NGINX and used with proxy_pass.
        """
        file_path = kwargs['file_path']
        file = f'/file_download/{file_path}'
        response = HttpResponse()
        response['Content-Disposition'] = 'inline'
        response['Accept-Ranges'] = 'bytes'
        response['X-Accel-Redirect'] = file
        del response['Content-Type']
        return response


class ResultListAPIView(ListAPIView):
    """
    Get list of all results for stuff or list of all results with released=True for not staff authenticated users.
    Accepts GET method.
    
    Display fields: 'id', 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'options',
                    'description', 'released', 'start_date', 'end_date', 'name', 'to_be_deleted', 'request',
                    'styles_url', 'labels'
                    
    Read-only fields: 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'to_be_deleted',
                      'request', 'styles_url', 'labels'
                      
    Returns: list of ResultModel fields.
    """
    permission_classes = (ModelPermissions, )
    queryset = Result.objects.all()
    http_method_names = ['get']
    serializer_class = ResultSerializer
    pagination_class = None
    filter_backends = (ResultsByACLFilterBackend,)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.has_perm('publisher.view_unreleased_result'):
            return queryset
        return queryset.filter(released=True)


class ResultRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    """
    Reads, updates and deletes ResultModel fields.
    Accepts: GET, PATCH, DELETE methods.

    Accepted field: 'id'.
    
    Display fields: 'id', 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'options',
                    'description', 'released', 'start_date', 'end_date', 'name', 'to_be_deleted', 'request',
                    'styles_url', 'labels'.
                    
    Read-only fields: 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'to_be_deleted',
                      'request', 'styles_url', 'labels'.

    Returns: ResultModel fields.
    """
    permission_classes = (ModelPermissions, ResultByACLPermission)
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    http_method_names = ("get", "patch", 'delete', )

    def get_queryset(self):
        if self.request.user.has_perm('publisher.view_unreleased_result'):
            return self.queryset
        return self.queryset.filter(released=True)

    def destroy(self, request, *args, **kwargs):
        result = self.get_object()
        result.to_be_deleted = True
        result.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
