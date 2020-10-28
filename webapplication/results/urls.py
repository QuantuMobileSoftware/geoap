from django.urls import path
from .views import FilesView

app_name = "results"


urlpatterns = [
    path('files/<file_path>/<file_name>', FilesView.as_view(), name='get_file'),
]
