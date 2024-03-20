import React from 'react';

import { ProgressName, ProgressBar, ProgressFileInfo } from './FileLoader.styles';

const ONE_MB = 1000000;
const ONE_KB = 1000;

export const LoadProgress = ({ progress }) => {
  const { name, size, percents } = progress;
  const fileSize =
    size > ONE_MB ? `${(size / ONE_MB).toFixed(1)}mb` : `${(size / ONE_KB).toFixed(1)}kb`;

  return (
    <div>
      <ProgressName>{name}</ProgressName>
      <ProgressFileInfo>{fileSize} - Loading</ProgressFileInfo>
      <ProgressBar percents={percents} />
    </div>
  );
};
