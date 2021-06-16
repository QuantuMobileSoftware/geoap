import React, { useCallback, useState, useMemo } from 'react';

import { MapContainer, TileLayer } from 'react-leaflet';

import { MapHolder, MapButtonsHolder, MapButton } from './Map.styles';

const center = [51.505, -0.09];
const initZoom = 13;

const MapControls = ({ map }) => {
  const handleIncreaseZoom = useCallback(() => {
    map.zoomIn();
  }, []);

  const handleDecreaseZoom = useCallback(() => {
    map.zoomOut();
  }, []);

  return (
    <MapButtonsHolder>
      <MapButton
        variant='floating'
        icon='Minus'
        marginBottom
        onClick={handleDecreaseZoom}
      ></MapButton>
      <MapButton variant='floating' icon='Plus' onClick={handleIncreaseZoom}></MapButton>
    </MapButtonsHolder>
  );
};

export const Map = () => {
  const [map, setMap] = useState(null);

  const mapView = useMemo(() => {
    return (
      <MapContainer
        center={center}
        zoom={initZoom}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
      </MapContainer>
    );
  }, []);

  return (
    <MapHolder>
      {mapView}
      {map ? <MapControls map={map} /> : null}
    </MapHolder>
  );
};
