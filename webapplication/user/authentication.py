from rest_framework.authentication import TokenAuthentication


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
