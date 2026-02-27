import React, { useEffect, useRef, useState } from 'react';
import { Header } from 'components/Header';
import { Breadcrumbs } from 'components/_shared/Breadcrumbs';
import { Icon } from 'components/_shared/Icon';
import { ROUTES } from '_constants';
import { API } from 'api';
import {
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
  CancelButton
} from 'pages/Upload/Upload.styles';
import {
  UploadPageContainer,
  Tabs,
  Tab,
  TabsLine,
  TabContent,
  MissionsWrapper,
  MissionListHeader,
  ListTitle,
  MissionsContainer,
  MissionItemBlock,
  MissionItem,
  MissionItemInfo,
  MissionDateInfo,
  HelpText,
  ToggleButton,
  ListProgressBarItem,
  ListProgressBarContainer,
  ListProgressBarFill,
  ListProgressBarText,
  UploadFormWrapper,
  CombinedSize,
  SuccessOverlay,
  SuccessCard,
  SuccessIconWrap,
  SuccessTitle,
  SuccessText,
  SuccessActions,
  SuccessButton,
  StatusMessage,
  EmptyState,
  UploadedFilesList,
  UploadedFilesGroup,
  UploadedFilesGroupTitle,
  UploadedFileEntry
} from './UploadMissions.styles';

const TABS = { LIST: 'Upload list', NEW: 'Uploads' };

const breadcrumbsItems = [{ link: ROUTES.ROOT, text: 'Home' }, { text: 'Upload data' }];

const UPLOAD_TYPES = {
  DATA_VIDEO: 'data_video',
  LOG: 'log',
  CALIBRATION: 'calibration_video'
};

const SIZE_WARN_MB = 5000;
const toMB = bytes => (bytes / 1024 / 1024).toFixed(2);
const mkFileItem = file => ({ file, progress: 0, uploading: false });

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'Uploading…',
  completed: 'Done',
  failed: 'Failed'
};

const formatDate = iso => {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear()} ${d.getHours()}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

const getTrajectoryInfo = ts => {
  if (!ts) return { status: null, label: 'Not started' };
  if (!ts.calculated) return { status: 'processing', label: 'Processing…' };
  return ts.success
    ? { status: 'traj_done', label: 'Ready' }
    : { status: 'traj_failed', label: 'Failed' };
};

export const UploadMissions = () => {
  const [selectedTab, setSelectedTab] = useState(TABS.LIST);

  // ── Mission list ──────────────────────────────────────────────────
  const [missions, setMissions] = useState([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [missionsError, setMissionsError] = useState(null);

  // ── Upload form ───────────────────────────────────────────────────
  const [dcimFiles, setDcimFiles] = useState([]);
  const [gpsFiles, setGpsFiles] = useState([]);
  const [calibFile, setCalibFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const xhrRefs = useRef({});
  const missionIdRef = useRef(null);

  const totalBytes =
    dcimFiles.reduce((s, f) => s + f.file.size, 0) +
    gpsFiles.reduce((s, f) => s + f.file.size, 0) +
    (calibFile ? calibFile.file.size : 0);

  const canStart =
    !uploading && !!calibFile && (dcimFiles.length > 0 || gpsFiles.length > 0);

  // ── API ───────────────────────────────────────────────────────────

  const getMissions = () => {
    setMissionsLoading(true);
    setMissionsError(null);
    API.upload
      .getMissions()
      .then(({ data }) => setMissions(data.map(m => ({ ...m, showDetails: false }))))
      .catch(() => setMissionsError('Failed to load missions.'))
      .finally(() => setMissionsLoading(false));
  };

  useEffect(() => {
    getMissions();
  }, []);

  // ── Mission list helpers ──────────────────────────────────────────

  const toggleDetails = id => {
    setMissions(prev =>
      prev.map(m => (m.id === id ? { ...m, showDetails: !m.showDetails } : m))
    );
  };

  // ── Upload helpers ────────────────────────────────────────────────

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
    setUploadError(null);

    let missionId = null;
    let sessionFolder = null;

    try {
      const { data: mission } = await API.upload.createMission();
      missionId = mission.id;
      missionIdRef.current = missionId;
      sessionFolder = mission.gcs_path;
    } catch {
      setUploadError('Failed to start upload. Please try again.');
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
      const uploadedFiles = [
        ...dcimFiles.map(f => ({ name: f.file.name, type: UPLOAD_TYPES.DATA_VIDEO })),
        ...gpsFiles.map(f => ({ name: f.file.name, type: UPLOAD_TYPES.LOG })),
        ...(calibFile
          ? [{ name: calibFile.file.name, type: UPLOAD_TYPES.CALIBRATION }]
          : [])
      ];
      await API.upload.updateMission(missionId, {
        status: 'completed',
        uploaded_files: uploadedFiles
      });
      setDcimFiles([]);
      setGpsFiles([]);
      setCalibFile(null);
      getMissions();
      setShowSuccess(true);
    } catch {
      if (missionId) {
        API.upload.updateMission(missionId, { status: 'failed' }).catch(() => {});
      }
      setUploadError('Upload failed. Please try again.');
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

  // ── Tab renders ───────────────────────────────────────────────────

  const FILE_TYPE_LABELS = {
    [UPLOAD_TYPES.DATA_VIDEO]: 'DCIM Videos',
    [UPLOAD_TYPES.LOG]: 'GPS Logs',
    [UPLOAD_TYPES.CALIBRATION]: 'Calibration'
  };

  const renderUploadedFiles = files => {
    if (!files || files.length === 0) return null;
    const groups = {};
    files.forEach(f => {
      const label = FILE_TYPE_LABELS[f.type] || f.type;
      if (!groups[label]) groups[label] = [];
      groups[label].push(f.name);
    });
    return (
      <UploadedFilesList>
        {Object.entries(groups).map(([label, names]) => (
          <UploadedFilesGroup key={label}>
            <UploadedFilesGroupTitle>{label}</UploadedFilesGroupTitle>
            {names.map(name => (
              <UploadedFileEntry key={name}>{name}</UploadedFileEntry>
            ))}
          </UploadedFilesGroup>
        ))}
      </UploadedFilesList>
    );
  };

  const renderMissionList = () => (
    <MissionsWrapper>
      <MissionListHeader>
        <ListTitle>Upload list</ListTitle>
      </MissionListHeader>
      <MissionsContainer>
        {missionsLoading && <EmptyState>Loading…</EmptyState>}
        {missionsError && <EmptyState>{missionsError}</EmptyState>}
        {!missionsLoading && !missionsError && missions.length === 0 && (
          <EmptyState>
            No uploads yet. Switch to &ldquo;Uploads&rdquo; to get started.
          </EmptyState>
        )}
        {missions.map(mission => {
          const trajInfo = getTrajectoryInfo(mission.trajectory_status);
          return (
            <MissionItemBlock key={mission.id}>
              <MissionItem>
                <HelpText fontSize={15}>{formatDate(mission.created_at)}</HelpText>
                <MissionItemInfo>
                  <ListProgressBarItem>
                    <ListProgressBarContainer title={`Upload status: ${mission.status}`}>
                      <ListProgressBarFill $status={mission.status} />
                      <ListProgressBarText>
                        {STATUS_LABELS[mission.status] || mission.status}
                      </ListProgressBarText>
                    </ListProgressBarContainer>
                  </ListProgressBarItem>
                  {mission.trajectory_status && (
                    <ListProgressBarItem title={`Preview: ${trajInfo.label}`}>
                      <ListProgressBarContainer>
                        <ListProgressBarFill $status={trajInfo.status} />
                        <ListProgressBarText>{trajInfo.label}</ListProgressBarText>
                      </ListProgressBarContainer>
                    </ListProgressBarItem>
                  )}
                  <ToggleButton
                    title='Show / hide details'
                    onClick={() => toggleDetails(mission.id)}
                  >
                    <Icon width={20} height={20}>
                      {mission.showDetails ? 'ExpandUp' : 'ExpandDown'}
                    </Icon>
                  </ToggleButton>
                </MissionItemInfo>
              </MissionItem>

              {mission.showDetails && (
                <MissionDateInfo>
                  <HelpText fontSize={13}>
                    Session:&nbsp;<strong>{mission.gcs_path}</strong>
                  </HelpText>
                  <HelpText fontSize={13}>
                    Uploaded:&nbsp;{formatDate(mission.created_at)}
                  </HelpText>
                  <HelpText fontSize={13}>
                    Upload status:&nbsp;{STATUS_LABELS[mission.status] || mission.status}
                  </HelpText>
                  <HelpText fontSize={13}>Preview:&nbsp;{trajInfo.label}</HelpText>
                  {mission.uploaded_files && mission.uploaded_files.length > 0 && (
                    <>
                      <HelpText fontSize={13} style={{ marginTop: 6 }}>
                        Files:
                      </HelpText>
                      {renderUploadedFiles(mission.uploaded_files)}
                    </>
                  )}
                </MissionDateInfo>
              )}
            </MissionItemBlock>
          );
        })}
      </MissionsContainer>
    </MissionsWrapper>
  );

  const renderNewUpload = () => (
    <UploadFormWrapper>
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
        {uploadError && <StatusMessage>{uploadError}</StatusMessage>}
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
    </UploadFormWrapper>
  );

  // ── Render ────────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <UploadPageContainer>
        <Breadcrumbs items={breadcrumbsItems} />

        <Tabs>
          {Object.values(TABS).map(tab => (
            <Tab
              key={tab}
              $selected={selectedTab === tab}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </Tab>
          ))}
          <TabsLine />
        </Tabs>

        <TabContent>
          {selectedTab === TABS.LIST ? renderMissionList() : renderNewUpload()}
        </TabContent>
      </UploadPageContainer>

      {showSuccess && (
        <SuccessOverlay>
          <SuccessCard>
            <SuccessIconWrap>✓</SuccessIconWrap>
            <SuccessTitle>Upload complete!</SuccessTitle>
            <SuccessText>All files have been uploaded successfully.</SuccessText>
            <SuccessActions>
              <SuccessButton
                onClick={() => {
                  setShowSuccess(false);
                  setSelectedTab(TABS.LIST);
                }}
              >
                View uploads
              </SuccessButton>
              <SuccessButton $secondary onClick={() => setShowSuccess(false)}>
                Upload more
              </SuccessButton>
            </SuccessActions>
          </SuccessCard>
        </SuccessOverlay>
      )}
    </>
  );
};
