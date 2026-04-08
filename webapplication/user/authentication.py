from rest_framework.authentication import BaseAuthentication, TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class CameraTokenAuthentication(BaseAuthentication):
    """
    Authenticates camera devices via 'Authorization: Bearer <token>' header.
    Resolves the token against the CameraToken model and returns the linked user.
    """
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        raw_token = auth_header[len('Bearer '):]
        if not raw_token:
            return None
        from user.models import CameraToken
        try:
            camera_token = CameraToken.objects.select_related('user').get(token=raw_token)
        except CameraToken.DoesNotExist:
            raise AuthenticationFailed('Invalid camera token.')
        return (camera_token.user, camera_token)


class TokenAuthenticationWithQueryString(TokenAuthentication):
    """
    Extend the TokenAuthentication class to support querystring authentication
    in the form of "http://www.example.com/?apikey=<token_key>"
    """
    def authenticate(self, request):
        if 'apikey' in request.query_params and \
                        'HTTP_AUTHORIZATION' not in request.META:
            return self.authenticate_credentials(request.query_params.get('apikey'))
        else:
            return super(TokenAuthenticationWithQueryString, self).authenticate(request)
