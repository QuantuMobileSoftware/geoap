from django.urls import path
from .views import FilesView

app_name = "results"


urlpatterns = [
    path('files/<path:file_path>', FilesView.as_view(), name='get_file'),
]
