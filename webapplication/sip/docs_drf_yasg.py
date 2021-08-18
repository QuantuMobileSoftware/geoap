from django.urls import path, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Sip API",
      default_version='v1',
      description="""
      <h1>Sip API</h1>
      <p><strong>For working with SIP API you need to get an {{access_token}}</strong>.</p>
      
      <h2>Get access token</h2>
      <h3>POST: api/login</h3>
      <h3>body json example:</h3>
         {
            "username": "test",
            "password": "pass"
         }
         </br>

      <h3>return json example:</h3>
         {
            "key": "507928511085e6584cfa105c74339d46fc097dd5"
         }
         </br>
      
      <p>
         Place 'apikey' parameter with this {{access_token}} as it's value in url - api/request?apikey={{access_token}}.
      </p>
      </br>
      
      <h2>Get your user_id:</h2>
      <h3>GET: api/users/current?apikey={{access_token}}<h3>
      <h3>return json example:</h3>
         {
             "pk": 2,
             "username": "test",
             "email": "",
             "first_name": "",
             "last_name": ""
         }
      </br>
      
      <h2>Create Area of interest:</h2>
      <h3>POST:</strong> api/aoi?apikey=your_token</h3>
      <h3>body json example:</h3>
         {
            "user": 2,
            "name": "Demo Field",
            "polygon": "SRID=4326;POLYGON ((-94.77618396165716 42.114449939047653 ,
            -94.77622261129523 42.122962521825265 ,  -94.77539164407744 42.122972184234769 ,
            -94.77513075902069 42.122286153159621 ,  -94.77524670793478 42.114469263866667 ,
            -94.77618396165716 42.114449939047653))"
         } 
         </br>
         
      <h3>return json example:</h3>
         {
             "id": 1,
             "user": 2,
             "name": "Demo Field",
             "polygon": "SRID=4326;POLYGON ((-94.77618396165715 42.11444993904765,
             -94.77622261129522 42.12296252182527, -94.77539164407744 42.12297218423477,
             -94.77513075902068 42.12228615315962, -94.77524670793478 42.11446926386667,
             -94.77618396165715 42.11444993904765))",
             "createdat": "2021-08-17T16:11:23.231130Z",
             "type": 2
         }
         </br>
      
      <h2>Create Request for calculation of TCI and NDVI on Sentinel-2 imagery for summer 2020</h2>
      <h3>POST: api/request?apikey={{access_token}}</h3>
      <h3>body json example:</h3>
         {
           "user": 2,
           "aoi": 1,
           "notebook": 2,
           "date_from": "2020-06-25",
           "date_to": "2020-07-25",
         }
      <h3>return json example:</h3>
         {
          "id": 1,
          "user": 2,
          "aoi": 1,
          "notebook": 2,
          "notebook_name": "TCI_NDVI",
          "date_from": "2020-06-25",
          "date_to": "2020-07-25",
          "started_at": null,
          "finished_at": null,
          "error": null,
          "calculated": false,
          "success": false,
          "polygon": "SRID=4326;POLYGON ((36.33779525756836 50.05697345978498, 36.3123893737793 50.05592644394527, 36.30964279174805 50.04517943449594, 36.31367683410645 50.03520185144665, 36.33110046386719 50.03035012265608, 36.353759765625 50.031122021389, 36.36208534240722 50.04176193236391, 36.35839462280273 50.052675038602, 36.35135650634766 50.05724898647173, 36.33779525756836 50.05697345978498))"
         }
         </br>
      <p>Once request is done one can observe results: TCI and NDVI</p>
      
      <h2>Get Results for given Area of interest</h2>
      <h3>GET: api/aoi/1/results?apikey={{access_token}}</h3>
      <h3>return json example:</h3>
         [
            {
               "id":1,
               "filepath":"example/tci_ndvi/11/11_36UYA_20200705_TCI.tif",
               "modifiedat":"2021-08-17T16:55:40.673586Z",
               "layer_type":"XYZ",
               "bounding_polygon":"SRID=4326;POLYGON ((36.36125413181414 50.02945674652011,
               36.36317533823156 50.05693091792921, 36.31045786648941 50.05844806784852,
               36.30856663968753 50.03097242889933, 36.36125413181414 50.02945674652011))",
               "rel_url":"/tiles/example/tci_ndvi/11/11_36UYA_20200705_TCI/{z}/{x}/{y}.png",
               "options":null,
               "description":"",
               "released":true,
               "start_date":"2021-07-05",
               "end_date":"2021-07-05",
               "name":"Sentinel-2 RGB raster",
               "to_be_deleted":false,
               "request":1,
               "styles_url":null,
               "labels":null
            },
            {
               "id":2,
               "filepath":"example/tci_ndvi/11/11_36UYA_20200705_NDVI.tif",
               "modifiedat":"2021-08-17T16:55:40.497586Z",
               "layer_type":"XYZ",
               "bounding_polygon":"SRID=4326;POLYGON ((36.36125413181414 50.02945674652011,
               36.36317533823156 50.05693091792921, 36.31045786648941 50.05844806784852,
               36.30856663968753 50.03097242889933, 36.36125413181414 50.02945674652011))",
               "rel_url":"/tiles/example/tci_ndvi/11/11_36UYA_20200705_NDVI/{z}/{x}/{y}.png",
               "options":null,
               "description":"",
               "released":true,
               "start_date":"2020-07-05",
               "end_date":"2020-07-05",
               "name":"Sentinel-2 Vegetation Index (NDVI)",
               "to_be_deleted":false,
               "request":1,
               "styles_url":null,
               "labels":null}
         ]
         </br>
      """,
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@sipxyz.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

urlpatterns = [
   re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
   path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
   path('docs/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

]
