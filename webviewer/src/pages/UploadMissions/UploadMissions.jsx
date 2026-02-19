import React, { useRef, useState } from 'react';
import { Header } from 'components/Header';
import { Breadcrumbs } from 'components/_shared/Breadcrumbs';
import { Icon } from 'components/_shared/Icon';
import { ROUTES } from '_constants';
import { API } from 'api';
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
} from 'pages/Upload/Upload.styles';
import {
  SessionNameRow,
  SessionNameLabel,
  SessionNameInput,
  CombinedSize
} from './UploadMissions.styles';

const breadcrumbsItems = [{ link: ROUTES.ROOT, text: 'Home' }, { text: 'Upload data' }];

const UPLOAD_TYPES = {
  DATA_VIDEO: 'data_video',
  LOG: 'log',
  CALIBRATION: 'calibration_video'
};

const SIZE_WARN_MB = 5000;

const nowString = () => {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(
    d.getHours()
  )}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
};

const mkFileItem = file => ({ file, progress: 0, uploading: false });

const toMB = bytes => (bytes / 1024 / 1024).toFixed(2);

export const UploadMissions = () => {
  const [dcimFiles, setDcimFiles] = useState([]);
  const [gpsFiles, setGpsFiles] = useState([]);
  const [calibFile, setCalibFile] = useState(null);
  const [sessionName, setSessionName] = useState(nowString);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const xhrRefs = useRef({});
  const missionIdRef = useRef(null);

  const totalBytes =
    dcimFiles.reduce((s, f) => s + f.file.size, 0) +
    gpsFiles.reduce((s, f) => s + f.file.size, 0) +
    (calibFile ? calibFile.file.size : 0);

  const canStart =
    !uploading && !!calibFile && (dcimFiles.length > 0 || gpsFiles.length > 0);

  const uploadFileXHR = (uploadUrl, file, onProgress) =>
    new Promise((resolve, reject) => {
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

  const handleUpload = async () => {
    setUploading(true);
    setSuccess(null);

    let missionId = null;
    let sessionFolder = sessionName;

    try {
      const { data: mission } = await API.upload.createMission();
      missionId = mission.id;
      missionIdRef.current = missionId;
      sessionFolder = mission.gcs_path;
    } catch {
      setSuccess(false);
      setUploading(false);
      return;
    }

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
                setCalibFile(prev =>
                  prev ? { ...prev, progress: p, uploading: u } : null
                )
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
        await uploadFileXHR(data.upload_url, item.fileItem.file, percent =>
          item.markProgress(percent, true)
        );
        item.markProgress(100, false);
      }
      await API.upload.updateMission(missionId, { status: 'completed' });
      setSuccess(true);
      setDcimFiles([]);
      setGpsFiles([]);
      setCalibFile(null);
    } catch (err) {
      if (missionId) {
        API.upload.updateMission(missionId, { status: 'failed' }).catch(() => {});
      }
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
    if (missionIdRef.current) {
      API.upload
        .updateMission(missionIdRef.current, { status: 'failed' })
        .catch(() => {});
      missionIdRef.current = null;
    }
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
    const files = Array.from(e.target.files).filter(f => f.name.endsWith('.log'));
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

  const renderFileRow = (item, onRemove) => {
    const sizeMB = parseFloat(toMB(item.file.size));
    return (
      <FileItem key={item.file.name}>
        <FileName title={item.file.name}>{item.file.name}</FileName>
        <FileItemInfo>
          <FileSize style={sizeMB > SIZE_WARN_MB ? { color: 'red' } : undefined}>
            {sizeMB} MB{sizeMB > SIZE_WARN_MB ? ' (!)' : ''}
          </FileSize>
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
  };

  return (
    <>
      <Header />
      <PageContainer>
        <Breadcrumbs items={breadcrumbsItems} />

        <SessionNameRow>
          <SessionNameLabel htmlFor='session-name-input'>Session name:</SessionNameLabel>
          <SessionNameInput
            id='session-name-input'
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            disabled={uploading}
          />
        </SessionNameRow>

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

          {/* GPS Logs */}
          <SectionCard>
            <SectionTitle>GPS Logs</SectionTitle>
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
              accept='.log'
              onChange={handleGpsChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </SectionCard>

          {/* Calibration */}
          <SectionCard>
            <SectionTitle>Calibration</SectionTitle>
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

        {totalBytes > 0 && <CombinedSize>Total size: {toMB(totalBytes)} MB</CombinedSize>}

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
              disabled={!canStart}
              onClick={handleUpload}
              icon={<Icon>Upload</Icon>}
            >
              Start upload
            </UploadButton>
          )}
        </ActionRow>
      </PageContainer>
    </>
  );
};
