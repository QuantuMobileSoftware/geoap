from django.contrib.gis.geos import GEOSGeometry
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView, RetrieveAPIView
from rest_framework.generics import get_object_or_404
from publisher.serializers import ResultSerializer
from publisher.models import Result
from publisher.filters import ResultsByACLFilterBackend
from .models import AoI, JupyterNotebook, Request
from .serializers import AoISerializer, JupyterNotebookSerializer, RequestSerializer
from user.permissions import ModelPermissions, IsOwnerPermission
from .permissions import AoIIsOwnerPermission
from user.models import User


class AoIListCreateAPIView(ListCreateAPIView):
    """
    Get list of all 'Areas of interest' created by user, or create new 'Area of interest' for user.
    Accepts GET, POST methods.
    
    Display fields: 'id', 'user', 'name', 'polygon', 'createdat', 'type'.
    
    Read-only fields: 'createdat'.
    
    Returns: list of AoIModel fields.
    """
    permission_classes = (ModelPermissions, )
    queryset = AoI.objects.all()
    serializer_class = AoISerializer
    pagination_class = None
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(user=self.request.user)
        
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.initial_data['user'] != self.request.user.id and \
                not self.request.user.has_perm('add_another_user_aoi'):
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer.is_valid(raise_exception=True)
        polygon_str = serializer.validated_data.get('polygon')
        if not self.request.user.can_add_new_area(polygon_str):
            raise PermissionDenied(detail='To access more areas, please contact the administrator')
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AoIRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    """
    Reads, updates and deletes ResultModel fields.
    Accepts: GET, PATCH, DELETE methods.
    Accepted field: 'id'.
    Display fields: 'id', 'user', 'name', 'polygon', 'createdat', 'type'.
    Read-only fields: 'createdat'.
    Returns: AoIModel fields.
    """
    permission_classes = (ModelPermissions, AoIIsOwnerPermission)
    queryset = AoI.objects.all()
    serializer_class = AoISerializer
    http_method_names = ("get", "patch", 'delete')
    lookup_url_kwarg = "pk"
    
    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.initial_data['user'] != self.request.user.id and \
                not self.request.user.has_perm('add_another_user_aoi'):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        if 'polygon' in serializer.initial_data:
            user = User.objects.get(id=serializer.initial_data['user'])
            if not user.can_update_area(self.kwargs[self.lookup_url_kwarg], serializer.initial_data['polygon']):
                raise PermissionDenied(detail='To access more areas, please contact the administrator')
        
        return self.partial_update(request, *args, **kwargs)


class AOIResultsListAPIView(ListAPIView):
    """
    Get list of all results for AoI.
    
    Accepts: GET method.
    
    Accepted field: 'id'.
    
    Display fields: 'id', 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'options',
                    'description', 'released', 'start_date', 'end_date', 'name', 'to_be_deleted', 'request',
                    'styles_url', 'labels'.
    
    Returns: list of ResultModel fields.
    """
    permission_classes = (ModelPermissions, )
    serializer_class = ResultSerializer
    queryset = Result.objects.all()
    filter_backends = (ResultsByACLFilterBackend, )
    lookup_url_kwarg = "pk"
    pagination_class = None

    def get_queryset(self):
        area_of_interest = get_object_or_404(AoI, id=self.kwargs[self.lookup_url_kwarg], user=self.request.user)
        qs = self.queryset.filter(bounding_polygon__bboverlaps=area_of_interest.polygon)
        if not self.request.user.has_perm('publisher.view_unreleased_result'):
            qs = qs.filter(released=True)
        return qs


class JupyterNotebookListCreateAPIView(ListCreateAPIView):
    """
    Get list of all JupyterNotebooks available in system, or creates new JupyterNotebook.
    Accepts GET, POST methods.
    Display fields: 'id', 'name', 'image', 'path', 'kernel_name', 'run_validation', 'success', 'options'.
    Read-only fields: None
    Returns: list of JupyterNotebookModel fields
    """
    permission_classes = (ModelPermissions, )
    queryset = JupyterNotebook.objects.all()
    serializer_class = JupyterNotebookSerializer
    pagination_class = None


class JupyterNotebookRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    """
    Reads, updates and deletes JupyterNotebook fields.
    Accepts: GET, PATCH, DELETE methods.
    Accepted field: 'id'.
    Display fields: 'id', 'name', 'image', 'path', 'kernel_name', 'run_validation', 'success', 'options'.
    Read-only fields: None.
    Returns: JupyterNotebookModel fields.
    """
    permission_classes = (ModelPermissions, )
    queryset = JupyterNotebook.objects.all()
    serializer_class = JupyterNotebookSerializer
    http_method_names = ("get", "patch", 'delete')
    
    
class RequestListCreateAPIView(ListCreateAPIView):
    """
    Get list of all Requests available for User, or creates new Request for calculation.
    Accepts: GET, POST methods.
    Accepted field (POST): 'user', 'aoi', 'notebook' 'date_from', 'date_to'.
    Display fields (GET): 'id', 'user', 'aoi', 'notebook', 'notebook_name', 'date_from', 'date_to', 'started_at',
                    'finished_at', 'error', 'calculated', 'success', 'polygon'.
    Read-only fields: 'polygon'.
    Returns: RequestModel fields.
    """
    permission_classes = (ModelPermissions, )
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    pagination_class = None
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.initial_data['user'] != self.request.user.id and \
                not self.request.user.has_perm('add_another_user_aoi'):
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    
class RequestRetrieveAPIView(RetrieveAPIView):
    """
    Reads Request fields.
    Accepts: GET method.
    Accepted field: 'id'.
    Display fields: 'id', 'user', 'aoi', 'notebook', 'notebook_name', 'date_from', 'date_to', 'started_at', 
                    'finished_at', 'error', 'calculated', 'success', 'polygon'.
    Returns: RequestModel fields.
    """
    permission_classes = (ModelPermissions, IsOwnerPermission)
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    http_method_names = ("get", )
    
    
class AOIRequestListAPIView(ListAPIView):
    """
    Get list of all Requests that were created for given 'Area Of Interest'
    Accepts: GET method.
    Accepted field: None.
    Display fields: 'id', 'user', 'aoi', 'notebook', 'notebook_name', 'date_from', 'date_to', 'started_at', 
                    'finished_at', 'error', 'calculated', 'success', 'polygon'.
    Returns: list of RequestModel fields.
    """
    permission_classes = (ModelPermissions, )
    serializer_class = RequestSerializer
    queryset = Request.objects.all()
    lookup_url_kwarg = "pk"
    pagination_class = None

    def get_queryset(self):
        area_of_interest = get_object_or_404(AoI, id=self.kwargs[self.lookup_url_kwarg], user=self.request.user)
        qs = self.queryset.filter(aoi=area_of_interest.id)
        return qs
