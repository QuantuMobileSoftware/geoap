from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry, GEOSException
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.serializers import ValidationError, as_serializer_error
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView, RetrieveAPIView
from rest_framework.generics import get_object_or_404
from publisher.serializers import ResultSerializer
from publisher.models import Result
from publisher.filters import ResultsByACLFilterBackend
from .models import AoI, Component, Request
from .serializers import AoISerializer, ComponentSerializer, RequestSerializer
from user.permissions import ModelPermissions, IsOwnerPermission
from .permissions import AoIIsOwnerPermission
from user.models import User, Transaction
from allauth.account import app_settings
from allauth.utils import build_absolute_uri


class AoIListCreateAPIView(ListCreateAPIView):
    """
    Get list of all 'Areas of interest' created by user, or create new 'Area of interest' for user.
    Accepts GET, POST methods.
    
    Display fields: 'id', 'user', 'name', 'polygon', 'createdat', 'type'.
    
    Read-only fields: 'createdat'.
    
    Returns: list of AoIModel fields.
    """
    permission_classes = (ModelPermissions, )
    queryset = AoI.objects.all()
    serializer_class = AoISerializer
    pagination_class = None
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(user=self.request.user)
        
    def create(self, request, *args, **kwargs):
        request_data = request.data.copy()
        request_data["available_dates"] = AoI.get_available_image_dates(request_data['polygon'], short_period=True)
        serializer = self.get_serializer(data=request_data)
        if serializer.initial_data['user'] != self.request.user.id and \
                not self.request.user.has_perm('add_another_user_aoi'):
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer.is_valid(raise_exception=True)
        polygon_str = serializer.validated_data.get('polygon')
        user = serializer.validated_data.get('user')
        if not user.can_add_new_area(polygon_str):
            data = {
                "errorCode": settings.AREA_IS_OVER_LIMITED_CODE,
                "detail": "Limit is exceeded! To access more areas, please contact the administrator."
                }
            return Response(data, status=status.HTTP_403_FORBIDDEN)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AoIRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    """
    Reads, updates and deletes ResultModel fields.
    Accepts: GET, PATCH, DELETE methods.
    Accepted field: 'id'.
    Display fields: 'id', 'user', 'name', 'polygon', 'createdat', 'type'.
    Read-only fields: 'createdat'.
    Returns: AoIModel fields.
    """
    permission_classes = (ModelPermissions, AoIIsOwnerPermission)
    queryset = AoI.objects.all()
    serializer_class = AoISerializer
    http_method_names = ("get", "patch", 'delete')
    lookup_url_kwarg = "pk"
    
    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.initial_data['user'] != self.request.user.id and \
                not self.request.user.has_perm('add_another_user_aoi'):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        if 'polygon' in serializer.initial_data:
            user = User.objects.get(id=serializer.initial_data['user'])
            if not user.can_update_area(self.kwargs[self.lookup_url_kwarg], serializer.initial_data['polygon']):
                data = {
                    "errorCode": settings.AREA_IS_OVER_LIMITED_CODE,
                    "detail": "Limit is exceeded! To access more areas, please contact the administrator."
                }
                return Response(data, status=status.HTTP_403_FORBIDDEN)
        
        return self.partial_update(request, *args, **kwargs)


class AOIResultsListAPIView(ListAPIView):
    """
    Get list of all results for AoI.
    
    Accepts: GET method.
    
    Accepted field: 'id'.
    
    Display fields: 'id', 'filepath', 'modifiedat', 'layer_type', 'bounding_polygon', 'rel_url', 'options',
                    'description', 'released', 'start_date', 'end_date', 'name', 'to_be_deleted', 'request',
                    'styles_url', 'labels'.
    
    Returns: list of ResultModel fields.
    """
    permission_classes = (ModelPermissions, )
    serializer_class = ResultSerializer
    queryset = Result.objects.all()
    filter_backends = (ResultsByACLFilterBackend, )
    lookup_url_kwarg = "pk"
    pagination_class = None

    def get_queryset(self):
        area_of_interest = get_object_or_404(AoI, id=self.kwargs[self.lookup_url_kwarg], user=self.request.user)
        qs = self.queryset.filter(bounding_polygon__bboverlaps=area_of_interest.polygon)
        if not self.request.user.has_perm('publisher.view_unreleased_result'):
            qs = qs.filter(released=True)
        return qs


class ComponentListCreateAPIView(ListCreateAPIView):
    """
    Get list of all JupyterNotebooks available in system, or creates new JupyterNotebook.
    Accepts GET, POST methods.
    Display fields: 'id', 'name', 'image', 'path', 'kernel_name', 'run_validation', 'success', 'options',
    'additional_parameter', 'period_required'.
    Read-only fields: None
    Returns: list of JupyterNotebookModel fields
    """
    permission_classes = (ModelPermissions, )
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
    pagination_class = None


class ComponentRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    """
    Reads, updates and deletes JupyterNotebook fields.
    Accepts: GET, PATCH, DELETE methods.
    Accepted field: 'id'.
    Display fields: 'id', 'name', 'image', 'path', 'kernel_name', 'run_validation', 'success', 'options',
    'additional_parameter', 'period_required'.
    Read-only fields: None.
    Returns: JupyterNotebookModel fields.
    """
    permission_classes = (ModelPermissions, )
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
    http_method_names = ("get", "patch", 'delete')


class RequestListCreateAPIView(ListCreateAPIView):
    """
    Get list of all Requests available for User, or creates new Request for calculation.
    Accepts: GET, POST methods.
    Accepted field (POST): 'user', 'aoi'[optional], 'polygon', 'notebook' 'date_from', 'date_to',
                    'additional_parameter'[optional].
    Display fields (GET): 'id', 'user', 'aoi', 'notebook', 'notebook_name', 'date_from', 'date_to', 'started_at',
                    'finished_at', 'error', 'calculated', 'success', 'polygon', 'additional_parameter'.
    Returns: RequestModel fields.
    """
    permission_classes = (ModelPermissions, )
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    pagination_class = None
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(user=self.request.user)

    def get_area_in_sq_km(self, validated_data):
        aoi = validated_data.get("aoi")
        if aoi:
            area = aoi.area_in_sq_km
        else:
            polygon = GEOSGeometry(validated_data.get("polygon"))
            area = AoI.polygon_in_sq_km(polygon)
        return area

    def create_transaction(self, user, amount, request):
        Transaction.objects.create(
            user=user,
            amount=-amount,
            request=request,
        )
        user.on_hold += amount
        user.save(update_fields=("on_hold",))

    def create(self, request, *args, **kwargs):
        request_data = request.data.copy()
        site_link = build_absolute_uri(request, "/", protocol=app_settings.DEFAULT_HTTP_PROTOCOL)
        request_data['request_origin'] = site_link
        serializer = self.get_serializer(data=request_data)
        if serializer.initial_data['user'] != self.request.user.id and \
                not self.request.user.has_perm('add_another_user_aoi'):
            return Response(status=status.HTTP_403_FORBIDDEN)
        component = Component.objects.get(pk=serializer.initial_data['notebook'])
        if not component.validated and \
                not self.request.user.has_perm('aoi.can_run_not_validated'):
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer.is_valid(raise_exception=True)
        try:
            area = self.get_area_in_sq_km(serializer.validated_data)
        except GEOSException:
            validation_error = ValidationError(_("Sorry, we couldn't process your request because the provided "
                                                 "location is invalid"))
            return Response(as_serializer_error(validation_error), status=status.HTTP_400_BAD_REQUEST)

        request_price = component.calculate_request_price(
            user=request.user,
            area=area
        )
        if serializer.validated_data.get("pre_submit"):
            self.perform_create(serializer)
            return Response({**serializer.data, "price": request_price}, status=status.HTTP_200_OK)
        user_actual_balance = request.user.actual_balance
        if user_actual_balance < request_price:
            validation_error = ValidationError(_(f"Your actual balance is {request.user.actual_balance}. "
                                                 f"It’s not enough to run the request. Please replenish the balance. "
                                                 f"Contact support (support@soilmate.ai)"))
            return Response(as_serializer_error(validation_error), status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            self.perform_create(serializer)
            self.create_transaction(
                user=request.user,
                amount=request_price,
                request=serializer.instance,
            )
        if not serializer.instance:
            validation_error = ValidationError(_("Error while creating a report"))
            return Response(as_serializer_error(validation_error), status=status.HTTP_400_BAD_REQUEST)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    
class RequestRetrieveAPIView(RetrieveAPIView):
    """
    Reads Request fields.
    Accepts: GET method.
    Accepted field: 'id'.
    Display fields: 'id', 'user', 'aoi', 'notebook', 'notebook_name', 'date_from', 'date_to', 'started_at', 
                    'finished_at', 'error', 'calculated', 'success', 'polygon', 'additional_parameter'.
    Returns: RequestModel fields.
    """
    permission_classes = (ModelPermissions, IsOwnerPermission)
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    http_method_names = ("get", )
    
    
class AOIRequestListAPIView(ListAPIView):
    """
    Get list of all Requests that were created for given 'Area Of Interest'
    Accepts: GET method.
    Accepted field: None.
    Display fields: 'id', 'user', 'aoi', 'notebook', 'notebook_name', 'date_from', 'date_to', 'started_at', 
                    'finished_at', 'error', 'calculated', 'success', 'polygon', 'additional_parameter'.
    Returns: list of RequestModel fields.
    """
    permission_classes = (ModelPermissions, )
    serializer_class = RequestSerializer
    queryset = Request.objects.all()
    lookup_url_kwarg = "pk"
    pagination_class = None

    def get_queryset(self):
        area_of_interest = get_object_or_404(AoI, id=self.kwargs[self.lookup_url_kwarg], user=self.request.user)
        qs = self.queryset.filter(aoi=area_of_interest.id)
        return qs
