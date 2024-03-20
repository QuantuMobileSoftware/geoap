import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { isEmpty } from 'lodash-es';
import { API } from 'api';
import { Button } from 'components/_shared/Button';
import { LoadProgress } from './LoadProgress';
import { selectCurrentResults } from 'state';
import {
  StyledFileLoader,
  FileLoaderContent,
  Title,
  FormatList,
  DownloadButton
} from './FileLoader.styles';

const getFileFormat = path => path.split('.').pop();

export const FileLoader = ({ selectedIdResults, top }) => {
  const allAreaResults = useSelector(selectCurrentResults);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const selectedResults = useMemo(
    () => allAreaResults.filter(({ id }) => selectedIdResults.some(item => item === id)),
    [allAreaResults, selectedIdResults]
  );
  const filesFormat = selectedResults.map(result => getFileFormat(result.filepath));
  const buttonText = selectedResults.length > 1 ? 'files' : 'file';

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
    setDownloadProgress({});
  };

  return (
    <StyledFileLoader top={top}>
      <Button
        icon={isOpen ? 'ExpandUp' : 'ExpandDown'}
        variant='secondary'
        onClick={() => setIsOpen(!isOpen)}
      >
        Download
      </Button>
      {isOpen && (
        <FileLoaderContent>
          <Title>File type</Title>
          <FormatList>{filesFormat.join(', ')}</FormatList>
          {Object.entries(downloadProgress).map(([id, progress]) => (
            <LoadProgress progress={progress} key={id} />
          ))}
          {isEmpty(downloadProgress) && (
            <DownloadButton onClick={handleDownloadFiles}>
              Download {buttonText}
            </DownloadButton>
          )}
        </FileLoaderContent>
      )}
    </StyledFileLoader>
  );
};
