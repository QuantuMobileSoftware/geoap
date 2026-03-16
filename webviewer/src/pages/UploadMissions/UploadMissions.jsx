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
  MissionFileList,
  MissionFileRow,
  MissionFileName,
  MissionFileSize,
  DownloadButton,
  StatusGroup,
  StatusChip
} from './UploadMissions.styles';

const TABS = { LIST: 'Upload list', NEW: 'New Upload' };

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
  in_progress: 'Uploading',
  completed: 'Done',
  failed: 'Failed'
};

const formatTimeLeft = (startTime, bytesLoaded, totalBytes) => {
  if (!startTime || bytesLoaded <= 0 || totalBytes <= 0) return null;
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed < 2) return null;
  const speed = bytesLoaded / elapsed;
  const remaining = totalBytes - bytesLoaded;
  if (remaining <= 0) return null;
  const secs = Math.round(remaining / speed);
  if (secs < 60) return `~${secs}s left`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `~${m}m ${s}s left` : `~${m}m left`;
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
  if (ts.success) return { status: 'traj_done', label: 'Ready' };
  if (ts.calculated) return { status: 'traj_failed', label: 'Failed' };
  return { status: 'processing', label: 'Processing…' };
};

// Returns true when a mission still needs live status updates.
// Keep polling while upload is running OR trajectory exists but hasn't finished yet.
const needsPolling = m =>
  m.status === 'in_progress' || (m.trajectory_status && !m.trajectory_status.calculated);

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
  const getMissionsRef = useRef(null);

  // ── Live upload progress (shown in the list while uploading) ──────
  const [liveUpload, setLiveUpload] = useState(null);

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
      .then(({ data }) => {
        // Any in_progress mission that doesn't belong to the current session is
        // orphaned (upload was killed by a page reload / navigation). Mark it failed.
        const currentId = missionIdRef.current;
        data.forEach(m => {
          if (m.status === 'in_progress' && m.id !== currentId) {
            API.upload.updateMission(m.id, { status: 'failed' }).catch(() => {});
          }
        });

        setMissions(prev => {
          const detailsMap = Object.fromEntries(prev.map(m => [m.id, m.showDetails]));
          return data.map(m => ({
            ...m,
            // Show failed immediately in UI without waiting for the patch response
            status:
              m.status === 'in_progress' && m.id !== currentId ? 'failed' : m.status,
            showDetails: detailsMap[m.id] ?? false
          }));
        });
      })
      .catch(() => setMissionsError('Failed to load missions.'))
      .finally(() => setMissionsLoading(false));
  };
  getMissionsRef.current = getMissions;

  useEffect(() => {
    getMissions();
  }, []);

  // ── Auto-poll while any mission needs live updates ────────────────
  const needsLiveUpdates = missions.some(needsPolling);
  useEffect(() => {
    if (!needsLiveUpdates) return;
    const id = setInterval(() => getMissionsRef.current(), 10000);
    return () => clearInterval(id);
  }, [needsLiveUpdates]);

  // ── Mark upload as failed when navigating away mid-upload ─────────
  useEffect(() => {
    const handleBeforeUnload = e => {
      if (missionIdRef.current) {
        e.preventDefault();
        e.returnValue =
          'Upload in progress. If you leave, the upload will be marked as failed.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // On component unmount (in-app navigation) mark upload as failed
  useEffect(() => {
    return () => {
      if (missionIdRef.current) {
        Object.values(xhrRefs.current).forEach(xhr => xhr && xhr.abort());
        API.upload
          .updateMission(missionIdRef.current, { status: 'failed' })
          .catch(() => {});
        missionIdRef.current = null;
      }
    };
  }, []);

  // ── Mission list helpers ──────────────────────────────────────────

  const toggleDetails = id => {
    setMissions(prev =>
      prev.map(m => (m.id === id ? { ...m, showDetails: !m.showDetails } : m))
    );
  };

  // ── Upload helpers ────────────────────────────────────────────────

  // onProgress(percent, loadedBytes)
  const uploadFileXHR = (uploadUrl, file, onProgress) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRefs.current[file.name] = xhr;
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.upload.onprogress = e => {
        if (e.lengthComputable)
          onProgress(Math.round((e.loaded / e.total) * 100), e.loaded);
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
      setLiveUpload({
        missionId,
        createdAt: new Date().toISOString(),
        progress: 0,
        startTime: Date.now(),
        bytesLoaded: 0
      });
      setSelectedTab(TABS.LIST);
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

    const totalBytesAll = queue.reduce((s, item) => s + item.fileItem.file.size, 0);
    let totalBytesLoaded = 0;

    try {
      for (const item of queue) {
        const bytesBeforeThisFile = totalBytesLoaded;
        item.markProgress(0, true);
        const { data } = await API.upload.getUploadURL(
          item.fileItem.file.name,
          item.fileItem.file.type || 'application/octet-stream',
          item.type,
          sessionFolder
        );
        await uploadFileXHR(data.upload_url, item.fileItem.file, (percent, loaded) => {
          item.markProgress(percent, true);
          if (totalBytesAll > 0) {
            const overall = Math.round(
              ((bytesBeforeThisFile + loaded) / totalBytesAll) * 100
            );
            setLiveUpload(prev =>
              prev
                ? {
                    ...prev,
                    progress: overall,
                    bytesLoaded: bytesBeforeThisFile + loaded
                  }
                : null
            );
          }
        });
        totalBytesLoaded += item.fileItem.file.size;
        item.markProgress(100, false);
      }

      const uploadedFiles = [
        ...dcimFiles.map(f => ({
          name: f.file.name,
          type: UPLOAD_TYPES.DATA_VIDEO,
          size: f.file.size
        })),
        ...gpsFiles.map(f => ({
          name: f.file.name,
          type: UPLOAD_TYPES.LOG,
          size: f.file.size
        })),
        ...(calibFile
          ? [
              {
                name: calibFile.file.name,
                type: UPLOAD_TYPES.CALIBRATION,
                size: calibFile.file.size
              }
            ]
          : [])
      ];
      await API.upload.updateMission(missionId, {
        status: 'completed',
        uploaded_files: uploadedFiles
      });
      missionIdRef.current = null;
      setDcimFiles([]);
      setGpsFiles([]);
      setCalibFile(null);
      setLiveUpload(null);
      getMissions();
      setShowSuccess(true);
    } catch {
      if (missionIdRef.current) {
        API.upload
          .updateMission(missionIdRef.current, { status: 'failed' })
          .catch(() => {});
        missionIdRef.current = null;
      }
      setLiveUpload(null);
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
    setLiveUpload(null);
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

  const handleDownload = async (fileName, fileType, gcsPath) => {
    try {
      const { data } = await API.upload.getDownloadURL(fileName, fileType, gcsPath);
      window.open(data.download_url, '_blank');
    } catch {
      // silently ignore
    }
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

  const renderMissionList = () => (
    <MissionsWrapper>
      <MissionListHeader>
        <ListTitle>Upload list</ListTitle>
      </MissionListHeader>

      {uploadError && (
        <StatusMessage style={{ marginBottom: 12 }}>
          {uploadError}{' '}
          <button
            onClick={() => {
              setUploadError(null);
              setSelectedTab(TABS.NEW);
            }}
            style={{
              marginLeft: 8,
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              textDecoration: 'underline',
              color: 'inherit',
              fontSize: 'inherit'
            }}
          >
            Try again
          </button>
        </StatusMessage>
      )}

      <MissionsContainer>
        {/* Live upload entry while uploading in background */}
        {uploading && liveUpload && (
          <MissionItemBlock key='live-upload'>
            <MissionItem>
              <HelpText fontSize={15}>{formatDate(liveUpload.createdAt)}</HelpText>
              <MissionItemInfo>
                <ListProgressBarItem>
                  {(() => {
                    const timeLeft = formatTimeLeft(
                      liveUpload.startTime,
                      liveUpload.bytesLoaded,
                      totalBytes
                    );
                    return (
                      <ListProgressBarContainer title='Uploading…'>
                        <ListProgressBarFill $width={liveUpload.progress} />
                        <ListProgressBarText>
                          {liveUpload.progress}%{timeLeft ? ` · ${timeLeft}` : ''}
                        </ListProgressBarText>
                      </ListProgressBarContainer>
                    );
                  })()}
                </ListProgressBarItem>
                <CancelButton
                  onClick={cancelUpload}
                  style={{ padding: '2px 10px', fontSize: 12 }}
                >
                  Cancel
                </CancelButton>
              </MissionItemInfo>
            </MissionItem>
          </MissionItemBlock>
        )}

        {missionsLoading && <EmptyState>Loading…</EmptyState>}
        {missionsError && <EmptyState>{missionsError}</EmptyState>}
        {!missionsLoading &&
          !missionsError &&
          missions.length === 0 &&
          !(uploading && liveUpload) && (
            <EmptyState>
              No uploads yet. Switch to &ldquo;New Upload&rdquo; to get started.
            </EmptyState>
          )}

        {missions
          .filter(m => !(uploading && m.id === missionIdRef.current))
          .map(mission => {
            const trajInfo = getTrajectoryInfo(mission.trajectory_status);
            const hasFiles = mission.uploaded_files && mission.uploaded_files.length > 0;
            return (
              <MissionItemBlock key={mission.id}>
                {/* ── Collapsed row ── */}
                <MissionItem>
                  <HelpText fontSize={15}>{formatDate(mission.created_at)}</HelpText>
                  <MissionItemInfo>
                    <StatusGroup>
                      <StatusChip
                        $status={mission.status}
                        title={`Upload: ${
                          STATUS_LABELS[mission.status] || mission.status
                        }`}
                      >
                        <Icon width={11} height={11}>
                          Upload
                        </Icon>
                        {STATUS_LABELS[mission.status] || mission.status}
                      </StatusChip>
                      {mission.trajectory_status && (
                        <StatusChip
                          $status={trajInfo.status}
                          title={`Preview: ${trajInfo.label}`}
                        >
                          <Icon width={11} height={11}>
                            Image
                          </Icon>
                          {trajInfo.label}
                        </StatusChip>
                      )}
                    </StatusGroup>
                    <ToggleButton
                      title='Show / hide session details'
                      onClick={() => toggleDetails(mission.id)}
                    >
                      <Icon width={20} height={20}>
                        {mission.showDetails ? 'ExpandUp' : 'ExpandDown'}
                      </Icon>
                    </ToggleButton>
                  </MissionItemInfo>
                </MissionItem>

                {/* ── Expanded: session metadata + file list ── */}
                {mission.showDetails && (
                  <>
                    <MissionDateInfo>
                      <HelpText fontSize={13}>
                        Session:&nbsp;<strong>{mission.gcs_path}</strong>
                      </HelpText>
                      <HelpText fontSize={13}>
                        Uploaded:&nbsp;{formatDate(mission.created_at)}
                      </HelpText>
                    </MissionDateInfo>
                    {hasFiles && (
                      <MissionFileList>
                        {mission.uploaded_files.map(f => (
                          <MissionFileRow key={f.name}>
                            <MissionFileName title={f.name}>{f.name}</MissionFileName>
                            {f.size != null && (
                              <MissionFileSize>{toMB(f.size)} MB</MissionFileSize>
                            )}
                            <DownloadButton
                              title='Download file'
                              onClick={() =>
                                handleDownload(f.name, f.type, mission.gcs_path)
                              }
                            >
                              <Icon width={16} height={16}>
                                Download
                              </Icon>
                            </DownloadButton>
                          </MissionFileRow>
                        ))}
                      </MissionFileList>
                    )}
                  </>
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
        {/* Videos */}
        <SectionCard>
          <SectionTitle>Videos</SectionTitle>
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
          <AddFileLabel htmlFor='dcim-input' $disabled={uploading}>
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
          <AddFileLabel htmlFor='gps-input' $disabled={uploading}>
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
          <AddFileLabel htmlFor='calib-input' $disabled={uploading}>
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
