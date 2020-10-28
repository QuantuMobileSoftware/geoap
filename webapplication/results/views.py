from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse


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
        file_name = kwargs['file_name']
        file = f'/file_download/{file_path}/{file_name}'
        response = HttpResponse()
        response['Content-Disposition'] = 'attachment; filename="{}"'.format(file_name)
        response['X-Accel-Redirect'] = file
        del response['Content-Type']
        del response['Accept-Ranges']
        del response['Set-Cookie']
        del response['Cache-Control']
        del response['Expires']
        return response
