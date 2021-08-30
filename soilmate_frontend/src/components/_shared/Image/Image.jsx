import React from 'react';

import { ImageBackdropIcon, ImageSource, StyledImage } from './Image.styles';

export const Image = ({ className, src, backdropIcon, ...props }) => {
  if (!src && !backdropIcon) return null;

  const renderImage = () => {
    return !src && backdropIcon ? (
      <ImageBackdropIcon>{backdropIcon}</ImageBackdropIcon>
    ) : (
      <ImageSource {...props} src={src} />
    );
  };

  return <StyledImage className={className}>{renderImage()}</StyledImage>;
};
