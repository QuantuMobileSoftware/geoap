const root = '/users';
const current = `${root}/current`;

// register user
const signup = '/signup';
const confirm = key => `${signup}/account-confirm-email/${key}`;
const resend = `${signup}/resend-email`;

// change password
const passwordRoot = '/password';
const password = {
  change: `${passwordRoot}/change`,
  forgot: `${passwordRoot}/reset`,
  confirm: (userId, token) => `${passwordRoot}/reset/confirm/${userId}/${token}`
};

export const usersEndpoints = { current, signup, confirm, resend, password };
