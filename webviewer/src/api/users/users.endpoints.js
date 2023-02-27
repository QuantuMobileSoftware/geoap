const root = '/users';
const current = `${root}/current`;

// register user
const signup = '/signup';
const confirm = key => `${signup}/account-confirm-email/${key}`;
const resend = `${signup}/resend-email`;

export const usersEndpoints = { current, signup, confirm, resend };
