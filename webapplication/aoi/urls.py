from django.urls import path
from .views import (AoIListCreateAPIView, AoIRetrieveUpdateDestroyAPIView, AOIResultsListAPIView,
                    ComponentListCreateAPIView, ComponentRetrieveUpdateDestroyAPIView,
                    RequestListCreateAPIView, RequestRetrieveAPIView, AOIRequestListAPIView)

app_name = 'aoi'
urlpatterns = [
    path('aoi', AoIListCreateAPIView.as_view(), name='aoi_list_or_create'),
    path('aoi/<int:pk>', AoIRetrieveUpdateDestroyAPIView.as_view(), name='aoi'),
    path('aoi/<int:pk>/results', AOIResultsListAPIView.as_view(), name='aoi_results'),
    path('aoi/<int:pk>/requests', AOIRequestListAPIView.as_view(), name='aoi_requests'),
    
    path('notebook', ComponentListCreateAPIView.as_view(), name='notebook_list_or_create'),
    path('notebook/<int:pk>', ComponentRetrieveUpdateDestroyAPIView.as_view(), name='notebook'),
    
    path('request', RequestListCreateAPIView.as_view(), name='request_list_or_create'),
    path('request/<int:pk>', RequestRetrieveAPIView.as_view(), name='request'),
]
