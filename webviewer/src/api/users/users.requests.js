import { axiosInstance } from 'api/instance';
import { usersEndpoints } from './users.endpoints';

const getCurrentUser = body => {
  return axiosInstance.get(usersEndpoints.current, body);
};

const updateUser = data => {
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

const forgotPassword = email => {
  return axiosInstance.post(usersEndpoints.password.forgot, email);
};

const confirmPassword = data => {
  return axiosInstance.post(usersEndpoints.password.confirm(data.uid, data.token), data);
};

export const usersRequests = {
  getCurrentUser,
  updateUser,
  registerUser,
  confirmRegistration,
  resendUserEmail,
  changePassword,
  forgotPassword,
  confirmPassword
};
