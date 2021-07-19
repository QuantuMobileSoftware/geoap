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

const deleteArea = id => {
  return axiosInstance.delete(`${areasEndpoints.root}/${id}`);
};

const patchArea = (id, data) => {
  return axiosInstance.patch(`${areasEndpoints.root}/${id}`, data);
};

const getLayers = () => {
  return axiosInstance.get(areasEndpoints.layers);
};

export const areasRequests = {
  getAreas,
  getArea,
  getAreaRequests,
  getAreaResults,
  saveArea,
  deleteArea,
  patchArea,
  getLayers
};
