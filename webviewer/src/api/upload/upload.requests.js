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
const deleteMission = id =>
  axiosInstance.delete(`${uploadEndpoints.uploadMissions}${id}/delete/`);
const removeMissionFiles = (id, fileNames) =>
  axiosInstance.post(`${uploadEndpoints.uploadMissions}${id}/remove_files/`, {
    files_to_remove: fileNames
  });
const getDownloadURL = (fileName, uploadType, sessionFolder) =>
  axiosInstance.get(uploadEndpoints.generateDownloadUrl, {
    params: {
      file_name: fileName,
      upload_type: uploadType,
      session_folder: sessionFolder
    }
  });

export const uploadRequests = {
  getUploadURL,
  getMissions,
  createMission,
  updateMission,
  deleteMission,
  removeMissionFiles,
  getDownloadURL
};
