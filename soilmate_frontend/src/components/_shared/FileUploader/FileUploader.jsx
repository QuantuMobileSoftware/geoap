import React, { useState, useRef, useEffect } from 'react';
import { ProgressBar, FileInfo, StyledUploader } from './FileUploader.styles';
import { kml } from '@tmcw/togeojson';

export const FileUploader = ({ isOpen, createShape }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('File');
  const [fileError, setFileError] = useState(false);
  const [isShowProgress, setIsShowProgress] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (isOpen) inputRef.current.click();
  }, [isOpen]);

  const handleChange = e => {
    const file = e.target.files[0];
    if (!file) {
      setIsShowProgress(false);
      return;
    }
    if (!file.type.includes('json') && !file.type.includes('kml')) {
      setFileError('Please upload file in geojson or kml format');
    }

    setFileName(file.name);

    const fileReader = new FileReader();
    fileReader.onloadstart = () => {
      setIsShowProgress(true);
    };

    fileReader.onload = () => {
      try {
        if (file.type.includes('kml')) {
          const result = kml(
            new DOMParser().parseFromString(fileReader.result, 'text/xml')
          );
          createShape(result);
        } else {
          const result = JSON.parse(fileReader.result);
          createShape(result);
        }
      } catch (err) {
        console.error('Parse error', err);
      }
    };

    fileReader.onerror = () => {
      setFileError(`${fileName} - Error : file is injured`);
    };
    fileReader.onprogress = progress => {
      const loaded = Math.round((progress.loaded * 100) / progress.total);
      setUploadProgress(loaded);
    };
    fileReader.readAsText(file);
  };

  return (
    <StyledUploader>
      <input ref={inputRef} type='file' onChange={handleChange} />
      {isShowProgress && (
        <>
          <ProgressBar percent={uploadProgress} />
          <FileInfo error={fileError}>
            <span>{fileError ? fileError : fileName}</span>
            <span>{uploadProgress}%</span>
          </FileInfo>
        </>
      )}
    </StyledUploader>
  );
};
