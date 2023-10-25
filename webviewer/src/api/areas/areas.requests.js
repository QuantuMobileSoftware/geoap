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

const saveAreaRequest = request => {
  return axiosInstance.post(areasEndpoints.request, request);
};

const getAllRequests = () => {
  return axiosInstance.get(areasEndpoints.request);
};

const getAreaResults = id => {
  return axiosInstance.get(areasEndpoints.results(id));
};

const getAllResults = () => {
  return axiosInstance.get(areasEndpoints.allResults);
};

const deleteResult = id => {
  return axiosInstance.delete(areasEndpoints.result(id));
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

const getField = (id, data) => {
  return axiosInstance.get(areasEndpoints.field(id), { params: data });
};

export const areasRequests = {
  getAreas,
  getArea,
  getAreaRequests,
  saveAreaRequest,
  getAllRequests,
  getAreaResults,
  getAllResults,
  deleteResult,
  saveArea,
  deleteArea,
  patchArea,
  getLayers,
  getField
};
