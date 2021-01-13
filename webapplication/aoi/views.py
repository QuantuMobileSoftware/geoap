from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView
from rest_framework.generics import get_object_or_404
from publisher.serializers import ResultSerializer
from publisher.models import Result
from publisher.filters import ResultsByACLFilterBackend
from .models import AoI, JupyterNotebook, Request
from .serializers import AoISerializer, JupyterNotebookSerializer, RequestSerializer
from user.permissions import ModelPermissions


class AoIListCreateAPIView(ListCreateAPIView):
    permission_classes = (ModelPermissions, )
    queryset = AoI.objects.all()
    serializer_class = AoISerializer
    pagination_class = None


class AoIRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = (ModelPermissions, )
    queryset = AoI.objects.all()
    serializer_class = AoISerializer
    http_method_names = ("get", "patch", 'delete')


class AOIResultsListAPIView(ListAPIView):
    permission_classes = (ModelPermissions, )
    serializer_class = ResultSerializer
    queryset = Result.objects.all()
    filter_backends = (ResultsByACLFilterBackend, )
    lookup_url_kwarg = "pk"
    pagination_class = None

    def get_queryset(self):
        area_of_interest = get_object_or_404(AoI, id=self.kwargs[self.lookup_url_kwarg])
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
    permission_classes = (ModelPermissions,)
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    pagination_class = None
    
    
class RequestRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = (ModelPermissions,)
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    http_method_names = ("get", "patch", 'delete')
