import React, { useMemo } from 'react';

import { ColorBarWrapper, ColorBar } from './MapColorBar.styles';

const colorsAmount = 256;
const data = {
  name: 'Vegetation index',
  colors: [],
  labels: ['low', 'high']
};

for (let i = 0; i < colorsAmount; i++) {
  data.colors.push([colorsAmount - i, i, 0]);
}

export const MapColorBar = () => {
  const gradientColors = useMemo(
    () => data.colors.map(color => `rgb(${color.toString()})`),
    []
  );

  return (
    <ColorBarWrapper>
      <ColorBar colors={gradientColors.toString()} />
    </ColorBarWrapper>
  );
};
