import React, { useCallback, useState, useMemo } from 'react';

import { TileLayer } from 'react-leaflet';

import { StyledMapContainer, MapHolder, MapButtonsHolder, MapButton } from './Map.styles';

const center = [51.505, -0.09];
const initZoom = 14;

const MapControls = ({ map }) => {
  const handleIncreaseZoom = useCallback(() => {
    map.zoomIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDecreaseZoom = useCallback(() => {
    map.zoomOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MapButtonsHolder>
      <MapButton variant='floating' icon='Plus' onClick={handleIncreaseZoom}></MapButton>
      <MapButton variant='floating' icon='Minus' onClick={handleDecreaseZoom}></MapButton>
    </MapButtonsHolder>
  );
};

export const Map = () => {
  const [map, setMap] = useState(null);

  const mapView = useMemo(() => {
    return (
      <StyledMapContainer
        center={center}
        zoom={initZoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
      </StyledMapContainer>
    );
  }, []);

  return (
    <MapHolder>
      {mapView}
      {map ? <MapControls map={map} /> : null}
    </MapHolder>
  );
};
