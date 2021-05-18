import Cookie from 'js-cookie';

import { API_CSRF_TOKEN_KEY, COOKIE_CSRF_TOKEN_KEY } from '_constants';

import { axiosInstance } from 'api/instance';
import { authEndpoints } from './auth.endpoints';

const login = async body => {
  const response = await axiosInstance.post(authEndpoints.login, body);
  const csrfToken = Cookie.get(COOKIE_CSRF_TOKEN_KEY);

  if (csrfToken) {
    axiosInstance.defaults.headers[API_CSRF_TOKEN_KEY] = csrfToken;
  }

  return response;
};

const logout = async body => {
  const response = await axiosInstance.post(authEndpoints.logout, body);
  Cookie.remove(COOKIE_CSRF_TOKEN_KEY);
  return response;
};

export const authRequests = { login, logout };
