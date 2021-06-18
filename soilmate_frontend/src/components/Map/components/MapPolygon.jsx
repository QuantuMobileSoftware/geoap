import React, { useEffect, useRef } from 'react';
import { Polygon } from 'react-leaflet';

export const MapPolygon = ({ map, coord }) => {
  const circleRef = useRef();
  useEffect(() => {
    map.panTo(circleRef.current.getCenter()).fitBounds(circleRef.current.getBounds());
  }, [map, coord]);
  return (
    <Polygon
      positions={coord}
      ref={circleRef}
      pathOptions={{ color: '#e3e3e3', fillColor: '#ffffff' }}
    />
  );
};
