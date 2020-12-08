from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from rest_framework import status
from publisher.serializers import ResultSerializer
from publisher.models import Result
from .models import AoI
from .serializers import AoISerializer


class AoIListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated, ]
    queryset = AoI.objects.all()
    serializer_class = AoISerializer
    pagination_class = None


class AoIRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = AoI.objects.all()
    serializer_class = AoISerializer
    http_method_names = ("get", "patch", 'delete')


class AOIResultsListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated, ]
    serializer_class = ResultSerializer
    queryset = Result.objects.all()
    lookup_url_kwarg = "pk"
    pagination_class = None

    def get_queryset(self):
        area_of_interest = get_object_or_404(AoI, id=self.kwargs[self.lookup_url_kwarg])
        qs = self.queryset.filter(bounding_polygon__bboverlaps=area_of_interest.polygon, to_be_deleted=False)
        if not self.request.user.is_staff:
            qs = qs.filter(released=True)
        return qs
