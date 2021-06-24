import React, { useEffect, useRef } from 'react';
import { Polygon } from 'react-leaflet';
import { SHAPE_OPTIONS } from '_constants';

export const MapPolygon = ({ map, coordinates, isActive = false }) => {
  const circleRef = useRef();
  useEffect(() => {
    if (isActive)
      map.panTo(circleRef.current.getCenter()).fitBounds(circleRef.current.getBounds());
  }, [map, coordinates, isActive]);
  return (
    <Polygon
      positions={coordinates}
      ref={circleRef}
      pathOptions={SHAPE_OPTIONS}
      eventHandlers={{
        click: () => {
          console.log(circleRef.current);
          map
            .panTo(circleRef.current.getCenter())
            .fitBounds(circleRef.current.getBounds());
        }
      }}
    />
  );
};
