import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { isEmpty } from 'lodash-es';
import { API } from 'api';
import { LoadProgress } from './LoadProgress';
import { selectCurrentResults } from 'state';
import { StyledFileLoader, StyledButton } from './FileLoader.styles';

const getFileFormat = path => path.split('.').pop();

export const FileLoader = ({ selectedIdResults }) => {
  const allAreaResults = useSelector(selectCurrentResults);
  const [downloadProgress, setDownloadProgress] = useState({});

  const selectedResults = useMemo(
    () => allAreaResults.filter(({ id }) => selectedIdResults.some(item => item === id)),
    [allAreaResults, selectedIdResults]
  );
  // const filesFormat = selectedResults.map(result => getFileFormat(result.filepath));
  const buttonText =
    selectedResults.length > 1 ? selectedResults.length + 'files' : '1 file';

  const handleDownloadFiles = async () => {
    const zip = new JSZip();
    const promises = selectedResults.map(async ({ filepath, name, id }) => {
      const response = await API.files.getFile(filepath, progress => {
        setDownloadProgress(state => ({ ...state, [id]: { ...progress, name } }));
      });
      zip.file(`${name}.${getFileFormat(filepath)}`, response);
    });
    await Promise.all(promises);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'results.zip');
    setTimeout(() => {
      setDownloadProgress({});
    }, 6000);
  };

  return (
    <StyledFileLoader>
      <StyledButton
        onClick={handleDownloadFiles}
        variant={isEmpty(downloadProgress) ? 'primary' : 'secondary'}
      >
        {Object.entries(downloadProgress).map(([id, progress]) => (
          <LoadProgress progress={progress} key={id} />
        ))}
        {isEmpty(downloadProgress) && `Download ${buttonText}`}
      </StyledButton>
    </StyledFileLoader>
  );
};
