from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListCreateAPIView, ListAPIView
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from publisher.serializers import ResultSerializer
from publisher.models import Result
from .models import AoI
from .serializers import AoISerializer


class AoIListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated, ]
    queryset = AoI.objects.all()
    serializer_class = AoISerializer


class AoIRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = AoI.objects.all()
    serializer_class = AoISerializer
    http_method_names = ("get", "patch", 'delete')

    def patch(self, request, *args, **kwargs):
        if request.user.is_staff:
            return super().patch(request)
        return Response({}, status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, *args, **kwargs):
        if request.user.is_staff:
            return super().destroy(request)
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class AOIResultsListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated, ]
    serializer_class = ResultSerializer
    queryset = Result.objects.all()
    lookup_url_kwarg = "pk"

    def get_queryset(self):
        area_of_interest = get_object_or_404(AoI, id=self.kwargs[self.lookup_url_kwarg])
        if self.request.user.is_staff:
            return self.queryset.filter(polygon__bboverlaps=area_of_interest.polygon)
        return self.queryset.filter(polygon__overlaps=area_of_interest.polygon, released=True)
