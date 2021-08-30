import { axiosInstance } from 'api/instance';
import { usersEndpoints } from './users.endpoints';

const getCurrentUser = body => {
  return axiosInstance.get(usersEndpoints.current, body);
};

export const usersRequests = { getCurrentUser };
