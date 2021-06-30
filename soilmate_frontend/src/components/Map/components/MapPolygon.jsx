import React, { useEffect, useRef } from 'react';
import { Polygon } from 'react-leaflet';

import { useAreasActions } from 'state';
import { SHAPE_OPTIONS } from '_constants';

export const MapPolygon = ({ map, coordinates, isActive = false }) => {
  const circleRef = useRef();
  const { setCurrentArea } = useAreasActions();

  const center = circleRef.current && circleRef.current.getCenter();
  const bounds = circleRef.current && circleRef.current.getBounds();

  useEffect(() => {
    if (isActive) {
      map.panTo(center).fitBounds(bounds);
    }
  }, [map, center, bounds, isActive]);

  return (
    <Polygon
      positions={coordinates}
      ref={circleRef}
      pathOptions={SHAPE_OPTIONS}
      eventHandlers={{
        click: () => {
          map.panTo(center).fitBounds(bounds);
        }
      }}
    />
  );
};
