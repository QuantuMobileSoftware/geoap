import { axiosInstance } from 'api/instance';
import { areasEndpoints } from './areas.endpoints';

const getAreas = () => {
  return axiosInstance.get(areasEndpoints.root);
};

const getArea = id => {
  return axiosInstance.get(areasEndpoints.byId(id));
};

const getAreaRequests = id => {
  return axiosInstance.get(areasEndpoints.requests(id));
};

const getAreaResults = id => {
  return axiosInstance.get(areasEndpoints.results(id));
};

const saveArea = area => {
  return axiosInstance.post(areasEndpoints.root, area);
};

export const areasRequests = {
  getAreas,
  getArea,
  getAreaRequests,
  getAreaResults,
  saveArea
};
