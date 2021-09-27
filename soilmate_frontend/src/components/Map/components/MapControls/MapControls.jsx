import React, { useCallback } from 'react';
import { MapButtonsHolder, MapButton } from './MapControls.styled';

export const MapControls = ({ map }) => {
  const handleIncreaseZoom = useCallback(() => {
    map.zoomIn();
  }, [map]);

  const handleDecreaseZoom = useCallback(() => {
    map.zoomOut();
  }, [map]);

  return (
    <MapButtonsHolder>
      <MapButton variant='floating' icon='Plus' onClick={handleIncreaseZoom}></MapButton>
      <MapButton variant='floating' icon='Minus' onClick={handleDecreaseZoom}></MapButton>
    </MapButtonsHolder>
  );
};
