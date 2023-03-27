import { axiosInstance } from 'api/instance';
import { usersEndpoints } from './users.endpoints';

const getCurrentUser = body => {
  return axiosInstance.get(usersEndpoints.current, body);
};

const setApiKey = data => {
  return axiosInstance.patch(usersEndpoints.current, data);
};

const registerUser = data => {
  return axiosInstance.post(usersEndpoints.signup, data);
};

const confirmRegistration = key => {
  return axiosInstance.get(usersEndpoints.confirm(key));
};

const resendUserEmail = email => {
  return axiosInstance.post(usersEndpoints.resend, { email });
};

const changePassword = data => {
  return axiosInstance.post(usersEndpoints.password.change, data);
};

export const usersRequests = {
  getCurrentUser,
  setApiKey,
  registerUser,
  confirmRegistration,
  resendUserEmail,
  changePassword
};
