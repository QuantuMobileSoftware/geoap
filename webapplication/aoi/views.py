from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView, RetrieveAPIView
from rest_framework.generics import get_object_or_404
from publisher.serializers import ResultSerializer
from publisher.models import Result
from publisher.filters import ResultsByACLFilterBackend
from .models import AoI, JupyterNotebook, Request
from .serializers import AoISerializer, JupyterNotebookSerializer, RequestSerializer
from user.permissions import ModelPermissions, IsOwnerPermission
from .permissions import AoIIsOwnerPermission


class AoIListCreateAPIView(ListCreateAPIView):
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
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AoIRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = (ModelPermissions, AoIIsOwnerPermission)
    queryset = AoI.objects.all()
    serializer_class = AoISerializer
    http_method_names = ("get", "patch", 'delete')
    
    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.initial_data['user'] != self.request.user.id and \
                not self.request.user.has_perm('add_another_user_aoi'):
            return Response(status=status.HTTP_403_FORBIDDEN)
        return self.partial_update(request, *args, **kwargs)


class AOIResultsListAPIView(ListAPIView):
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
    permission_classes = (ModelPermissions, )
    queryset = JupyterNotebook.objects.all()
    serializer_class = JupyterNotebookSerializer
    pagination_class = None


class JupyterNotebookRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = (ModelPermissions, )
    queryset = JupyterNotebook.objects.all()
    serializer_class = JupyterNotebookSerializer
    http_method_names = ("get", "patch", 'delete')
    
    
class RequestListCreateAPIView(ListCreateAPIView):
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
    permission_classes = (ModelPermissions, IsOwnerPermission)
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    http_method_names = ("get", )
    
    
class AOIRequestListAPIView(ListAPIView):
    permission_classes = (ModelPermissions, )
    serializer_class = RequestSerializer
    queryset = Request.objects.all()
    lookup_url_kwarg = "pk"
    pagination_class = None

    def get_queryset(self):
        area_of_interest = get_object_or_404(AoI, id=self.kwargs[self.lookup_url_kwarg], user=self.request.user)
        qs = self.queryset.filter(aoi=area_of_interest.id)
        return qs
