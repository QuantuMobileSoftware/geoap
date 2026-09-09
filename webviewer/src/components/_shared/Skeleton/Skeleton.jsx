import React from 'react';
import { StyledSkeleton } from './Skeleton.styles';

export const Skeleton = React.memo(({ width = '100%', height = '100%', ...props }) => (
  <StyledSkeleton $width={width} $height={height} {...props} />
));
