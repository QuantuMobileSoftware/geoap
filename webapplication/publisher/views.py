import geopandas as gpd
from shapely.geometry import Point
from pathlib import Path
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListAPIView, RetrieveUpdateDestroyAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework import status
from django.conf import settings
from rest_framework.exceptions import APIException
from django.http import HttpResponse
from .models import Result
from .serializers import ResultSerializer, PointSerializer
from .filters import ResultsByACLFilterBackend
from .permissions import ResultByACLPermission
from user.permissions import ModelPermissions
from user.authentication import TokenAuthenticationWithQueryString
from publisher.utils import zip_files


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
        file_paths = request.data
        if not file_paths:
            return Response({"detail": "No file paths provided in the request body."}, status=400)
        if len(file_paths)>1:
            file_path = zip_files(file_paths)
        else:
            file_path = file_paths[0]
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
                    'styles_url', 'labels', 'colormap'.
                    
    Read-only fields: 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'to_be_deleted',
                      'request', 'styles_url', 'labels', 'colormap'.
                      
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
        request_id = self.request.query_params.get('request_id')
        if request_id is not None:
            queryset = queryset.filter(request_id=request_id)
        if not self.request.user.has_perm('publisher.view_unreleased_result'):
            queryset = queryset.filter(released=True)
        return queryset


class ResultRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    """
    Reads, updates and deletes ResultModel fields.
    Accepts: GET, PATCH, DELETE methods.

    Accepted field: 'id'.
    
    Display fields: 'id', 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'options',
                    'description', 'released', 'start_date', 'end_date', 'name', 'to_be_deleted', 'request',
                    'styles_url', 'labels', 'colormap'.
                    
    Read-only fields: 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'to_be_deleted',
                      'request', 'styles_url', 'labels', 'colormap'.

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
        if (result.request and result.request.user == request.user)\
                or request.user.has_perm("publisher.delete_any_result"):
            result.to_be_deleted = True
            result.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_403_FORBIDDEN)


class GetFieldFromResultAPIView(RetrieveAPIView):
    permission_classes = (ModelPermissions, ResultByACLPermission)
    queryset = Result.objects.all()
    serializer_class = PointSerializer
    lookup_url_kwarg = "pk"
    
    def get_queryset(self):
        if self.request.user.has_perm('publisher.view_unreleased_result'):
            return self.queryset
        return self.queryset.filter(released=True)
    
    def get(self, request, *args, **kwargs):
        result = self.get_object()
        data = {'lat': request.query_params['lat'], 'lng': request.query_params['lng']}
        point_serializer = self.get_serializer(data=data)
        point_serializer.is_valid(raise_exception=True)
        point = Point(point_serializer.validated_data['lat'], point_serializer.validated_data['lng'])
        try:
            df = gpd.read_file(Path(settings.RESULTS_FOLDER) / result.filepath)
        except Exception:
            raise APIException(detail=f'result with id {self.kwargs[self.lookup_url_kwarg]} \
            does not contain valid geojson')

        output = df.loc[df.contains(point) == True]
        if len(output) > 1:
            raise APIException(detail=f'result with id {self.kwargs[self.lookup_url_kwarg]} has contains {len(output)} \
            polygons that contain {point}')

        if len(output) == 0:
            raise APIException(detail=f'result with id {self.kwargs[self.lookup_url_kwarg]} does not have any polygons \
            that contain {point}')

        polygon = f"SRID={output.crs.srs.split(':')[1]};{output.iloc[0]['geometry'].wkt}"
        return Response({'polygon': polygon})
