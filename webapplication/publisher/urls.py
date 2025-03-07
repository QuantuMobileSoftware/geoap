from django.urls import path
from .views import (
    FilesView,
    ResultListAPIView,
    ResultRetrieveUpdateDestroyAPIView,
    GetFieldFromResultAPIView,
    UpdateGpxFileAPIView
)

urlpatterns = [
    path('files/<path:file_path>', FilesView.as_view(), name='get_file'),
    path('results', ResultListAPIView.as_view(), name='get_results'),
    path('results/<int:pk>', ResultRetrieveUpdateDestroyAPIView.as_view(), name='result'),
    path('results/<int:pk>/field/', GetFieldFromResultAPIView.as_view(), name='field_from_result'),
    path('validate/<int:pk>', UpdateGpxFileAPIView.as_view(), name='update_gpx_file'),
]
