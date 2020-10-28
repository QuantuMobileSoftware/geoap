# from django.shortcuts import render
from django.views import View
from django.http import HttpResponse
from django.conf import settings


class FilesView(View):
    """
    Get files from local storage.
    """
    def get(self, request, *args, **kwargs) -> HttpResponse:
        """
        The parts are then rebuilt by NGINX and used with proxy_pass.
        """
        if request.user and request.user.is_authenticated:
            print('user is auth')
            file_path = kwargs['file_path']
            file_name = kwargs['file_name']
            file = f'/file_download/{file_path}/{file_name}'
            print('dyman', file)
            response = HttpResponse()
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(file_name)
            response['X-Accel-Redirect'] = file
            del response['Content-Type']
            del response['Accept-Ranges']
            del response['Set-Cookie']
            del response['Cache-Control']
            del response['Expires']
            return response

        print('hohoho')
        return HttpResponse(status=400)
