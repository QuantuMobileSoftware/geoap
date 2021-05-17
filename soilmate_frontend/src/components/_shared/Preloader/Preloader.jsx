import React, { useEffect, useState } from 'react';

import {
  PreloaderBody,
  PreloaderIcon,
  PreloaderOverlay,
  StyledPreloader
} from './Preloader.styles';

export const Preloader = ({
  delay = 2000,
  position = 'absolute',
  isTransparent = true,
  ...props
}) => {
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    let timeout = setTimeout(() => setIsHidden(false), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <StyledPreloader {...props} position={position}>
      <PreloaderOverlay isTransparent={isTransparent} />

      <PreloaderBody isHidden={isHidden}>
        <PreloaderIcon />
      </PreloaderBody>
    </StyledPreloader>
  );
};
