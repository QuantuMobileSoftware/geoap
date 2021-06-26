import React, { useEffect, useRef } from 'react';
import { Polygon } from 'react-leaflet';
import { useAreasActions } from 'state';
import { SHAPE_OPTIONS } from '_constants';

export const MapPolygon = ({ map, coordinates, isActive = false }) => {
  const circleRef = useRef();
  const { setCurrentArea } = useAreasActions();
  useEffect(() => {
    if (isActive)
      map.panTo(circleRef.current.getCenter()).fitBounds(circleRef.current.getBounds());
    setCurrentArea(null);
  }, [map, coordinates, isActive, setCurrentArea]);
  return (
    <Polygon
      positions={coordinates}
      ref={circleRef}
      pathOptions={SHAPE_OPTIONS}
      eventHandlers={{
        click: () => {
          map
            .panTo(circleRef.current.getCenter())
            .fitBounds(circleRef.current.getBounds());
        }
      }}
    />
  );
};
