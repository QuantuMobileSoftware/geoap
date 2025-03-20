import { axiosInstance } from 'api/instance';
import { filesEndpoints } from './files.endpoints';

const getFile = async (path, onProgress) => {
  const resp = await axiosInstance.get(`${filesEndpoints.results}/${path}`, {
    responseType: 'blob',
    onDownloadProgress: progressEvent => {
      const percentCompleted = (progressEvent.loaded / progressEvent.total) * 100;
      onProgress({ percents: Math.round(percentCompleted), size: progressEvent.total });
    }
  });
  return resp.data;
};

const getStoneImages = async resultId => {
  const resp = await axiosInstance.get(filesEndpoints.stoneImages(resultId));
  return resp.data;
};

const patchStoneImages = async (resultId, data) => {
  const resp = await axiosInstance.patch(filesEndpoints.stoneImages(resultId), data);
  return resp.data;
};

export const fileRequests = { getFile, getStoneImages, patchStoneImages };
