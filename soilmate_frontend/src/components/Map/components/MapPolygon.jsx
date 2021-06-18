import React, { useEffect } from 'react';
import { Polygon } from 'react-leaflet';

export const MapPolygon = ({ map, coord }) => {
  useEffect(() => {
    map.setView(coord[0], 12);
  }, [map, coord]);
  return (
    <Polygon positions={coord} pathOptions={{ color: '#e3e3e3', fillColor: '#ffffff' }} />
  );
};
