import React, { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';
import { getPolygonPositions } from '../../utils/helpers';

import L from 'leaflet';
import { TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { selectAreasList, selectCurrentArea, useAreasActions, selectUser } from 'state';
import { SHAPE_OPTIONS } from '_constants';
import { areasEvents } from '_events';
import { MapControls, MapPolygon } from './components';
import { Popup } from 'components/_shared/Popup';
import { StyledMapContainer, MapHolder } from './Map.styles';
import { getShapePositionsString } from 'utils/helpers';

const center = [51.505, -0.09];
const initZoom = 14;

export const Map = () => {
  const [map, setMap] = useState(null);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [currentShape, setCurrentShape] = useState();
  const initialAreas = useSelector(selectAreasList);
  const currentArea = useSelector(selectCurrentArea);
  const currentUser = useSelector(selectUser);
  const { addArea } = useAreasActions();
  const afterShapeCreated = e => {
    setIsShowPopup(true);
    setCurrentShape(e.layer);
  };

  useEffect(() => {
    if (map) map.on('draw:created', afterShapeCreated);
    if (map) return () => map.off('draw:created', afterShapeCreated);
  }, [map]);
  useEffect(() => {
    return areasEvents.onCreateShape(e => {
      const shape = new L.Draw[e.shapeType](map, { shapeOptions: SHAPE_OPTIONS });
      shape.enable();
    });
  }, [map]);

  const handleRemoveCurrentShape = () => {
    map.removeLayer(currentShape);
    setIsShowPopup(false);
  };
  const handleSaveCurrentShape = () => {
    setIsShowPopup(false);
    const data = {
      user: currentUser.pk,
      name: `shape ${initialAreas.length}`,
      polygon: getShapePositionsString(currentShape)
    };
    addArea(data);
  };

  return (
    <MapHolder>
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
        <FeatureGroup>
          <EditControl
            position='topright'
            draw={{
              rectangle: false,
              circle: false,
              polyline: false,
              circlemarker: false,
              marker: false,
              polygon: false
            }}
            edit={{
              edit: false,
              remove: false
            }}
          />
        </FeatureGroup>
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
      {map ? <MapControls map={map} /> : null}
      {isShowPopup && (
        <Popup
          header='Are you sure with this area?'
          confirmText='Choose this selection'
          cancel={handleRemoveCurrentShape}
          save={handleSaveCurrentShape}
        />
      )}
    </MapHolder>
  );
};
