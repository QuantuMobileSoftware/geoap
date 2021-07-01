import React, { useRef } from 'react';
import { Polygon } from 'react-leaflet';

import { SHAPE_OPTIONS } from '_constants';

export const MapPolygon = ({ coordinates, onClick }) => {
  const polyRef = useRef(null);
  return (
    <Polygon
      ref={polyRef}
      positions={coordinates}
      pathOptions={SHAPE_OPTIONS}
      eventHandlers={{
        click: () => onClick(polyRef.current)
      }}
    />
  );
};
