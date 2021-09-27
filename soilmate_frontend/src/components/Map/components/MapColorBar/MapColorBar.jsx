import React, { useMemo } from 'react';

import {
  ColorBarWrapper,
  ColorBar,
  ColorBarTitle,
  ColorBarLabels
} from './MapColorBar.styles';

export const MapColorBar = ({ colorMap: { colors, labels, name } }) => {
  const gradientColors = useMemo(
    () => colors.map(color => `rgb(${color.toString()})`),
    [colors]
  );

  return (
    <ColorBarWrapper>
      <ColorBarTitle>{name}</ColorBarTitle>
      <ColorBar colors={gradientColors.toString()} />
      <ColorBarLabels>
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </ColorBarLabels>
    </ColorBarWrapper>
  );
};
