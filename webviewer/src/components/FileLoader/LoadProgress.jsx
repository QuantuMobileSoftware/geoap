import React, { useEffect, useState } from 'react';

import {
  ProgressName,
  ProgressBar,
  ProgressFileInfo,
  ProgressWrapper
} from './FileLoader.styles';
import { Done } from 'assets/icons';

const ONE_MB = 1000000;
const ONE_KB = 1000;

export const LoadProgress = ({ progress }) => {
  const { name, size, percents } = progress;
  const fileSize =
    size > ONE_MB ? `${(size / ONE_MB).toFixed(1)}mb` : `${(size / ONE_KB).toFixed(1)}kb`;

  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    if (percents === 100) {
      const timer = setTimeout(() => {
        setShowDone(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowDone(false);
    }
  }, [percents]);

  return (
    <ProgressWrapper>
      <ProgressName>{name}</ProgressName>
      <ProgressFileInfo>
        <span>{fileSize} - </span>
        {percents !== 100 || !showDone ? (
          <span>Loading</span>
        ) : (
          <span>
            Done <Done />
          </span>
        )}
      </ProgressFileInfo>
      {(percents !== 100 || !showDone) && <ProgressBar percents={percents} />}
    </ProgressWrapper>
  );
};
