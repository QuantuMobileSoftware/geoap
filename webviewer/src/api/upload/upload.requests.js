import { axiosInstance } from 'api/instance';
import { uploadEndpoints } from './upload.endpoints';

const getUploadURL = (fileName, fileType, uploadType, sessionFolder) => {
  const params = {
    file_name: fileName,
    file_type: fileType,
    upload_type: uploadType
  };
  if (sessionFolder) params.session_folder = sessionFolder;
  return axiosInstance.get(uploadEndpoints.generateUploadUrl, { params });
};

const getMissions = () => axiosInstance.get(uploadEndpoints.uploadMissions);
const createMission = () => axiosInstance.post(uploadEndpoints.uploadMissions);
const updateMission = (id, data) =>
  axiosInstance.patch(`${uploadEndpoints.uploadMissions}${id}/`, data);

export const uploadRequests = { getUploadURL, getMissions, createMission, updateMission };
