import Cookie from 'js-cookie';

export const API_CSRF_TOKEN_KEY = 'X-CSRFToken';
export const COOKIE_CSRF_TOKEN_KEY = 'csrftoken';
export const COOKIE_CSRF_TOKEN_VALUE = Cookie.get(COOKIE_CSRF_TOKEN_KEY);

export const USER_COOKIE_KEY = 'user';
