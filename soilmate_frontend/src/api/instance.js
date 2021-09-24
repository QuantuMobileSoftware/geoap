import axios from 'axios';
import { areasEvents } from '_events';

import { API_CSRF_TOKEN_KEY, COOKIE_CSRF_TOKEN_VALUE } from '_constants';

export const axiosInstance = axios.create({
  baseURL: '/api',
  headers: { [API_CSRF_TOKEN_KEY]: COOKIE_CSRF_TOKEN_VALUE }
});

const handleError = error => {
  let parsedError = error.response;
  areasEvents.toggleErrorModal(parsedError);

  if (error.response.data.detail) {
    parsedError = error.response.data.detail;
  }

  if (error.response.data?.non_field_errors) {
    parsedError = error.response.data.non_field_errors[0];
  }

  return Promise.reject(parsedError);
};

axiosInstance.interceptors.request.use(request => request, handleError);

axiosInstance.interceptors.response.use(response => response, handleError);
