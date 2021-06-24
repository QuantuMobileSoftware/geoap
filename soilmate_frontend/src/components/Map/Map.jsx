import React, { useState, useMemo } from 'react';

import { useSelector } from 'react-redux';
import { getPolygonPositions } from '../../utils/helpers';

import { TileLayer } from 'react-leaflet';
import { selectAreasList, selectCurrentArea } from 'state';

import { MapControls, MapPolygon } from './components';
import { StyledMapContainer, MapHolder } from './Map.styles';

const center = [51.505, -0.09];
const initZoom = 14;

export const Map = () => {
  const [map, setMap] = useState(null);
  const initialAreas = useSelector(selectAreasList);
  const currentArea = useSelector(selectCurrentArea);

  const mapView = useMemo(() => {
    return (
      <StyledMapContainer
        center={center}
        zoom={initZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {initialAreas &&
          initialAreas.map(area => (
            <MapPolygon
              map={map}
              coordinates={getPolygonPositions(area).coordinates[0]}
              key={area.id}
              isActive={area.id === currentArea}
            />
          ))}
      </StyledMapContainer>
    );
  }, [initialAreas, currentArea, map]);

  return (
    <MapHolder>
      {mapView}
      {map ? <MapControls map={map} /> : null}
    </MapHolder>
  );
};
