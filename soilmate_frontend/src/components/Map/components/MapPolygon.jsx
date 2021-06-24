import React, { useEffect, useRef } from 'react';
import { Polygon } from 'react-leaflet';

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
      pathOptions={{ color: '#e3e3e3', fillColor: '#ffffff' }}
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
