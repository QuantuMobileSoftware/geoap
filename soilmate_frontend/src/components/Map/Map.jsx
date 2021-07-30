import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import 'leaflet-editable';
import { TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import { SHAPE_OPTIONS, SIDEBAR_MODE } from '_constants';
import { areasEvents } from '_events';
import { MapControls, MapPolygon } from './components';
import { Popup } from 'components/_shared/Popup';
import { Spinner } from 'components/_shared/Spinner';
import { StyledMapContainer, MapHolder } from './Map.styles';

import {
  selectAreasList,
  selectCurrentArea,
  useAreasActions,
  selectUser,
  selectSidebarMode,
  getLoading
} from 'state';

import { getShapePositionsString, getPolygonPositions, getCentroid } from 'utils/helpers';

import { useMapEvents } from './useMapEvents';
import { useMapRequests } from './useMapRequests';

const center = [51.505, -0.09];
const initZoom = 14;

const getShapePositions = polygon => {
  const latLangs = getPolygonPositions(polygon).coordinates[0];
  const polyline = L.polyline(latLangs);
  const center = getCentroid(latLangs);
  const bounds = polyline.getBounds();
  return { center, bounds };
};

export const Map = () => {
  const [map, setMap] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [currentShape, setCurrentShape] = useState();
  const [drawingShape, setDrawingShape] = useState();
  const [selectedArea, setSelectedArea] = useState();

  const initialAreas = useSelector(selectAreasList);
  const currentAreaId = useSelector(selectCurrentArea);
  const currentUser = useSelector(selectUser);
  const sidebarMode = useSelector(selectSidebarMode);
  const isLoading = useSelector(getLoading);
  const { saveArea, setCurrentArea, setSidebarMode } = useAreasActions();

  const newAreaNumber = initialAreas.length
    ? initialAreas[initialAreas.length - 1].id + 1
    : 1;

  useEffect(() => {
    if (map && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        map.panTo([position.coords.latitude, position.coords.longitude]);
      });
    }
  }, [map]);

  useEffect(() => {
    const polygon = initialAreas.find(area => area.id === currentAreaId);
    if (!polygon || !map) {
      return;
    }
    setSelectedArea(polygon);
    const { center, bounds } = getShapePositions(polygon);
    map.panTo(center).fitBounds(bounds);
  }, [currentAreaId, initialAreas, map]);

  useMapEvents(map, setIsPopupVisible, setCurrentShape);
  useMapRequests(selectedArea, map);

  useEffect(() => {
    return areasEvents.onCreateShape(({ json, isShowPopup, shapeType }) => {
      if (json) {
        if (json.features[0].geometry.type !== 'Polygon') {
          console.warn('Please add file with polygon coordinates'); // show error for user
          return;
        }
        const shape = L.geoJSON(json, { style: SHAPE_OPTIONS });
        const createShape = () => {
          if (isShowPopup) {
            setIsPopupVisible(true);
          }
          setCurrentShape(shape);
        };

        shape.on('add', createShape);
        shape.addTo(map);
        const { center, bounds } = getShapePositions({
          polygon: getShapePositionsString(shape)
        });
        map.panTo(center).fitBounds(bounds);
        return () => shape.off('add', createShape);
      } else {
        const shape = new L.Draw[shapeType](map, { shapeOptions: SHAPE_OPTIONS });
        shape.enable();
        setDrawingShape(shape);
      }
    });
  }, [map]);

  useEffect(() => {
    return areasEvents.onStopDrawing(() => {
      drawingShape.disable();
    });
  }, [drawingShape]);

  useEffect(() => {
    if (currentShape) {
      return areasEvents.onUpdateShape(() => map.removeLayer(currentShape));
    }
  }, [map, currentShape]);

  const handleCancelSaveShape = () => {
    map.removeLayer(currentShape);
    setIsPopupVisible(false);
    areasEvents.closePopup();
  };

  const handleSaveShape = async () => {
    setIsPopupVisible(false);
    const data = {
      user: currentUser.pk,
      name: `New area ${newAreaNumber}`,
      polygon: getShapePositionsString(currentShape)
    };
    map.removeLayer(currentShape);
    await saveArea(data);
    setSidebarMode(SIDEBAR_MODE.EDIT);
  };

  const handlePolygonClick = id => polygon => {
    const center = polygon.getCenter();
    const bounds = polygon.getBounds();
    map.panTo(center).fitBounds(bounds);
    setCurrentArea(id);
  };

  return (
    <MapHolder>
      <StyledMapContainer
        editable={true}
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
              key={area.id}
              id={area.id}
              map={map}
              coordinates={getPolygonPositions(area).coordinates[0]}
              onClick={handlePolygonClick(area.id)}
              isEditable={sidebarMode === SIDEBAR_MODE.EDIT && area.id === currentAreaId}
            />
          ))}
        {isLoading && <Spinner />}
      </StyledMapContainer>
      {map ? <MapControls map={map} /> : null}
      {isPopupVisible && (
        <Popup
          header='Are you sure with this area?'
          confirmPopup='Choose this selection'
          cancel={handleCancelSaveShape}
          save={handleSaveShape}
        />
      )}
    </MapHolder>
  );
};
