import React, { useState, useMemo, useEffect } from 'react';

import { useSelector } from 'react-redux';
import { getIndexById, getPolygonPositions } from '../../utils/helpers';

import { TileLayer } from 'react-leaflet';
import { selectAreasList, selecCurrentArea } from 'state';

import { MapControls, MapPolygon } from './components';
import { StyledMapContainer, MapHolder } from './Map.styles';

const center = [51.505, -0.09];
const initZoom = 14;

export const Map = () => {
  const [map, setMap] = useState(null);
  const initialAreas = useSelector(selectAreasList);
  const currentArea = useSelector(selecCurrentArea);

  const positions = getPolygonPositions(
    initialAreas[getIndexById(currentArea, initialAreas)]
  );

  const mapView = useMemo(() => {
    const coordinates = positions ? positions.coordinates[0] : false;
    return (
      <StyledMapContainer
        center={coordinates ? coordinates[0] : center}
        zoom={initZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {coordinates && map && <MapPolygon map={map} coord={coordinates} />}
      </StyledMapContainer>
    );
  }, [positions, map]);

  return (
    <MapHolder>
      {mapView}
      {map ? <MapControls map={map} /> : null}
    </MapHolder>
  );
};
