const ROOT = '/';
const AUTH = `${ROOT}auth`;
const SIGN_UP = `${ROOT}signup`;
const SIGN_UP_CONFIRM = `${ROOT}signup/account-confirm-email/:id`;
const ACCOUNT = `${ROOT}account`;

const PASSWORD_ROOT = `${ROOT}password`;
const RESET_PASSWORD = `${PASSWORD_ROOT}/reset`;
const FORGOT_PASSWORD = `${PASSWORD_ROOT}/forgot`;
const CONFIRM_PASSWORD = `${PASSWORD_ROOT}/reset/confirm/:uid/:token`;

export const ROUTES = {
  ROOT,
  AUTH,
  SIGN_UP,
  SIGN_UP_CONFIRM,
  ACCOUNT,
  RESET_PASSWORD,
  FORGOT_PASSWORD,
  CONFIRM_PASSWORD
};
