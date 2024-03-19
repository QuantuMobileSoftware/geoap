import { axiosInstance } from 'api/instance';
import { filesEndpoints } from './files.endpoints';

const getFile = async path => {
  const resp = await axiosInstance.get(`${filesEndpoints.results}/${path}`, {
    responseType: 'blob'
  });
  return resp.data;
};

export const fileRequests = { getFile };
