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
  try {
    return await axiosInstance.post(authEndpoints.logout, body, {
      skipErrorModal: true
    });
  } finally {
    Cookie.remove(COOKIE_CSRF_TOKEN_KEY);
  }
};

export const authRequests = { login, logout };
