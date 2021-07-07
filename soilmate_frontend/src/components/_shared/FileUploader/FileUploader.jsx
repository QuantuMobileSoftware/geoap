import React, { useState, useRef, useEffect } from 'react';
import { ProgressBar, FileInfo, StyledUploader } from './FileUploader.styles';

export const FileUploader = ({ isOpen }) => {
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
    setFileName(file.name);
    const fileReader = new FileReader();
    fileReader.onloadstart = () => {
      setIsShowProgress(true);
    };

    fileReader.onload = () => {
      //const stringData = fileReader.result;
      // do something with data
    };

    fileReader.onerror = () => {
      setFileError('File_name.KML  - Error : file is injured');
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
