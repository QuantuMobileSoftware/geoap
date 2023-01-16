import { axiosInstance } from 'api/instance';
import { usersEndpoints } from './users.endpoints';

const getCurrentUser = body => {
  return axiosInstance.get(usersEndpoints.current, body);
};

const setApiKey = data => {
  return axiosInstance.patch(usersEndpoints.current, data);
};

export const usersRequests = { getCurrentUser, setApiKey };
