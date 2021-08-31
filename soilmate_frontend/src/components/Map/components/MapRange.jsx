import React, { useState } from 'react';
import { Range } from 'react-range';
import { useMapActions } from 'state';
import { StyledMapRange, RangeThumb, RangeTrack } from '../Map.styles';

export const MapRange = () => {
  const { setLayerOpacity } = useMapActions();
  const [value, setValue] = useState([1]);
  const handleChange = value => {
    setValue(value);
    setLayerOpacity(value[0]);
  };

  return (
    <StyledMapRange>
      <span>Opacity</span>
      <Range
        step={0.01}
        min={0}
        max={1}
        values={value}
        onChange={handleChange}
        renderTrack={({ props, children }) => (
          <RangeTrack value={value * 100} {...props}>
            {children}
          </RangeTrack>
        )}
        renderThumb={({ props }) => <RangeThumb {...props} />}
      />
    </StyledMapRange>
  );
};
