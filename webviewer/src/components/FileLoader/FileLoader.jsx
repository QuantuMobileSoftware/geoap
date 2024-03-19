import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { API } from 'api';
import { Button } from 'components/_shared/Button';
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
  const [isOpen, setIsOpen] = useState(false);

  const selectedResults = useMemo(
    () => allAreaResults.filter(({ id }) => selectedIdResults.some(item => item === id)),
    [allAreaResults, selectedIdResults]
  );
  const filesFormat = selectedResults.map(result => getFileFormat(result.filepath));
  const buttonText = selectedResults.length > 1 ? 'files' : 'file';

  const handleDownloadFiles = async () => {
    const zip = new JSZip();
    const promises = selectedResults.map(async ({ filepath, name }) => {
      const response = await API.files.getFile(filepath);
      zip.file(`${name}.${getFileFormat(filepath)}`, response);
    });
    await Promise.all(promises);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'results.zip');
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
          <DownloadButton onClick={handleDownloadFiles}>
            Download {buttonText}
          </DownloadButton>
        </FileLoaderContent>
      )}
    </StyledFileLoader>
  );
};
