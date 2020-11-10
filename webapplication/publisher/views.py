from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from .models import Result
from .serializers import ResultSerializer


class FilesView(APIView):
    """
    Get files from local storage.
    """
    permission_classes = (IsAuthenticated,)

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
    """
    permission_classes = [IsAuthenticated]
    queryset = Result.objects.all()
    http_method_names = ['get']
    serializer_class = ResultSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(released=True, to_be_deleted=False)


class ResultRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    http_method_names = ("get", "patch", 'delete')

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(released=True, to_be_deleted=False)

    def patch(self, request, *args, **kwargs):
        if request.user.is_staff:
            return super().patch(request)
        return Response({}, status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, *args, **kwargs):
        if request.user.is_staff:
            result = self.get_object()
            result.to_be_deleted = True
            result.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)
