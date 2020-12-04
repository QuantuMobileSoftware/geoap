from django.urls import path
from .views import (AoIListCreateAPIView, AoIRetrieveUpdateDestroyAPIView, AOIResultsListAPIView)

app_name = 'aoi'
urlpatterns = [
    path('aoi', AoIListCreateAPIView.as_view(), name='aoi_list_or_create'),
    path('aoi/<int:pk>', AoIRetrieveUpdateDestroyAPIView.as_view(), name='aoi'),
    path('aoi/<int:pk>/results', AOIResultsListAPIView.as_view(), name='aoi_results'),
]
