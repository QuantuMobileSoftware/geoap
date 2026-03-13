import React, { useRef, useState } from 'react';
import { Header } from 'components/Header';
import { Breadcrumbs } from 'components/_shared/Breadcrumbs';
import { Icon } from 'components/_shared/Icon';
import { ROUTES } from '_constants';
import { API } from 'api';
import { areasEvents } from '_events';
import {
  PageContainer,
  SectionsGrid,
  SectionCard,
  SectionTitle,
  FileList,
  FileItem,
  FileItemInfo,
  FileName,
  FileSize,
  RemoveButton,
  AddFileLabel,
  ProgressBarContainer,
  ProgressBarFill,
  ProgressBarText,
  UploadInfo,
  ActionRow,
  UploadButton,
  CancelButton,
  StatusMessage
} from './Upload.styles';

const breadcrumbsItems = [{ link: ROUTES.ROOT, text: 'Home' }, { text: 'Upload' }];

const UPLOAD_TYPES = {
  DATA_VIDEO: 'data_video',
  LOG: 'log',
  CALIBRATION: 'calibration_video'
};

const mkFileItem = file => ({ file, progress: 0, uploading: false });

export const Upload = () => {
  const [dcimFiles, setDcimFiles] = useState([]);
  const [gpsFiles, setGpsFiles] = useState([]);
  const [calibFile, setCalibFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const xhrRefs = useRef({});

  const totalFiles = dcimFiles.length + gpsFiles.length + (calibFile ? 1 : 0);

  const uploadFileXHR = (uploadUrl, file, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRefs.current[file.name] = xhr;
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload failed: HTTP ${xhr.status}`));
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });
  };

  const handleUpload = async () => {
    if (totalFiles === 0) return;
    setUploading(true);
    setSuccess(null);
    let sessionFolder = null;

    const queue = [
      ...dcimFiles.map((f, i) => ({
        fileItem: f,
        type: UPLOAD_TYPES.DATA_VIDEO,
        markProgress: (p, u) =>
          setDcimFiles(prev =>
            prev.map((item, j) =>
              j === i ? { ...item, progress: p, uploading: u } : item
            )
          )
      })),
      ...gpsFiles.map((f, i) => ({
        fileItem: f,
        type: UPLOAD_TYPES.LOG,
        markProgress: (p, u) =>
          setGpsFiles(prev =>
            prev.map((item, j) =>
              j === i ? { ...item, progress: p, uploading: u } : item
            )
          )
      })),
      ...(calibFile
        ? [
            {
              fileItem: calibFile,
              type: UPLOAD_TYPES.CALIBRATION,
              markProgress: (p, u) =>
                setCalibFile(prev => ({ ...prev, progress: p, uploading: u }))
            }
          ]
        : [])
    ];

    try {
      for (const item of queue) {
        item.markProgress(0, true);
        const { data } = await API.upload.getUploadURL(
          item.fileItem.file.name,
          item.fileItem.file.type || 'application/octet-stream',
          item.type,
          sessionFolder
        );
        sessionFolder = data.session_folder;
        await uploadFileXHR(data.upload_url, item.fileItem.file, percent =>
          item.markProgress(percent, true)
        );
        item.markProgress(100, false);
      }
      setSuccess(true);
      setDcimFiles([]);
      setGpsFiles([]);
      setCalibFile(null);
    } catch (err) {
      areasEvents.toggleErrorModal(err.message || 'Upload failed');
      setSuccess(false);
    } finally {
      setUploading(false);
      xhrRefs.current = {};
    }
  };

  const cancelUpload = () => {
    Object.values(xhrRefs.current).forEach(xhr => xhr && xhr.abort());
    xhrRefs.current = {};
    setUploading(false);
    setDcimFiles(prev => prev.map(f => ({ ...f, progress: 0, uploading: false })));
    setGpsFiles(prev => prev.map(f => ({ ...f, progress: 0, uploading: false })));
    setCalibFile(prev => (prev ? { ...prev, progress: 0, uploading: false } : null));
  };

  const handleDcimChange = e => {
    const files = Array.from(e.target.files);
    setDcimFiles(prev => {
      const names = new Set(prev.map(f => f.file.name));
      return [...prev, ...files.filter(f => !names.has(f.name)).map(mkFileItem)];
    });
    e.target.value = '';
  };

  const handleGpsChange = e => {
    const files = Array.from(e.target.files);
    setGpsFiles(prev => {
      const names = new Set(prev.map(f => f.file.name));
      return [...prev, ...files.filter(f => !names.has(f.name)).map(mkFileItem)];
    });
    e.target.value = '';
  };

  const handleCalibChange = e => {
    const file = e.target.files[0];
    if (file) setCalibFile(mkFileItem(file));
    e.target.value = '';
  };

  const renderFileRow = (item, onRemove) => (
    <FileItem key={item.file.name}>
      <FileName title={item.file.name}>{item.file.name}</FileName>
      <FileItemInfo>
        <FileSize>{(item.file.size / 1024 / 1024).toFixed(2)} MB</FileSize>
        {!uploading && (
          <RemoveButton onClick={onRemove}>
            <Icon>Delete</Icon>
          </RemoveButton>
        )}
        {(item.uploading || item.progress === 100) && (
          <ProgressBarContainer>
            <ProgressBarFill
              $width={item.progress}
              $done={!item.uploading && item.progress === 100}
            />
            <ProgressBarText>
              {item.progress === 100 ? 'Done' : `${item.progress}%`}
            </ProgressBarText>
          </ProgressBarContainer>
        )}
      </FileItemInfo>
    </FileItem>
  );

  return (
    <>
      <Header />
      <PageContainer>
        <Breadcrumbs items={breadcrumbsItems} />
        <SectionsGrid>
          {/* DCIM Videos */}
          <SectionCard>
            <SectionTitle>DCIM Videos</SectionTitle>
            {dcimFiles.length === 0 ? (
              <UploadInfo>No videos added yet</UploadInfo>
            ) : (
              <FileList>
                {dcimFiles.map((item, i) =>
                  renderFileRow(item, () =>
                    setDcimFiles(prev => prev.filter((_, j) => j !== i))
                  )
                )}
              </FileList>
            )}
            <AddFileLabel htmlFor='dcim-input'>
              <Icon>Plus</Icon> Add Videos
            </AddFileLabel>
            <input
              id='dcim-input'
              type='file'
              multiple
              accept='.mp4,video/mp4'
              onChange={handleDcimChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </SectionCard>

          {/* GPS Log */}
          <SectionCard>
            <SectionTitle>GPS Log</SectionTitle>
            {gpsFiles.length === 0 ? (
              <UploadInfo>No log files added yet</UploadInfo>
            ) : (
              <FileList>
                {gpsFiles.map((item, i) =>
                  renderFileRow(item, () =>
                    setGpsFiles(prev => prev.filter((_, j) => j !== i))
                  )
                )}
              </FileList>
            )}
            <AddFileLabel htmlFor='gps-input'>
              <Icon>Plus</Icon> Add Log Files
            </AddFileLabel>
            <input
              id='gps-input'
              type='file'
              multiple
              onChange={handleGpsChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </SectionCard>

          {/* Calibration Video */}
          <SectionCard>
            <SectionTitle>Calibration Video</SectionTitle>
            {!calibFile ? (
              <UploadInfo>No calibration video added yet</UploadInfo>
            ) : (
              <FileList>{renderFileRow(calibFile, () => setCalibFile(null))}</FileList>
            )}
            <AddFileLabel htmlFor='calib-input'>
              <Icon>Plus</Icon> {calibFile ? 'Replace Video' : 'Add Video'}
            </AddFileLabel>
            <input
              id='calib-input'
              type='file'
              accept='.mp4,video/mp4'
              onChange={handleCalibChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </SectionCard>
        </SectionsGrid>

        <ActionRow>
          {success === true && (
            <StatusMessage $success>All files uploaded successfully!</StatusMessage>
          )}
          {success === false && (
            <StatusMessage>Upload failed. Please try again.</StatusMessage>
          )}
          {uploading ? (
            <CancelButton onClick={cancelUpload}>Cancel</CancelButton>
          ) : (
            <UploadButton
              disabled={totalFiles === 0}
              onClick={handleUpload}
              icon={<Icon>Upload</Icon>}
            >
              Upload
            </UploadButton>
          )}
        </ActionRow>
      </PageContainer>
    </>
  );
};
