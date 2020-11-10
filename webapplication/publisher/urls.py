from django.urls import path
from .views import (FilesView, ResultListAPIView, ResultRetrieveUpdateDestroyAPIView, AoIListCreateAPIView,
                    AoIRetrieveUpdateDestroyAPIView, AOIResultsListAPIView)

urlpatterns = [
    path('files/<path:file_path>', FilesView.as_view(), name='get_file'),
    path('results', ResultListAPIView.as_view(), name='get_results'),
    path('results/<int:pk>', ResultRetrieveUpdateDestroyAPIView.as_view(), name='result'),
    path('aoi', AoIListCreateAPIView.as_view(), name='aoi'),
    path('aoi/<int:pk>', AoIRetrieveUpdateDestroyAPIView.as_view(), name='rud_aoi'),
    path('aoi/<int:pk>/results', AOIResultsListAPIView.as_view(), name='aoi_results'),
]
