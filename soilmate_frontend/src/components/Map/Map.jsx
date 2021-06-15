import React from 'react';

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';

export const Map = () => {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <ZoomControl position='bottomright' />
    </MapContainer>
  );
};
