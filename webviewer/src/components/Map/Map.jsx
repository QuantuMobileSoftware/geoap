import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import 'leaflet-editable';
import { TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import { useAreaData } from 'hooks';
import {
  SHAPE_OPTIONS,
  SIDEBAR_MODE,
  AOI_TYPE,
  SHAPE_NAMES,
  NOT_POLYGON
} from '_constants';
import { areasEvents } from '_events';
import { MapColorBar, MapControls, MapRange, MapPolygon } from './components';
import { Popup } from 'components/_shared/Popup';
import { Spinner } from 'components/_shared/Spinner';
import { StyledMapContainer, MapHolder } from './Map.styles';

import {
  selectAreasList,
  selectCurrentArea,
  useAreasActions,
  selectSidebarMode,
  getLoading,
  getSelectedResults
} from 'state';

import { getShapePositionsString, getPolygonPositions, getCentroid } from 'utils/helpers';

import { useMapEvents } from './useMapEvents';
import { useMapRequests } from './useMapRequests';

const center = [51.505, -0.09];
const initZoom = 14;
const { FIELDS, EDIT, AREAS } = SIDEBAR_MODE;

const getShapePositions = polygon => {
  const latLangs = getPolygonPositions(polygon).coordinates[0];
  const polyline = L.polyline(latLangs);
  const center = getCentroid(latLangs);
  const bounds = polyline.getBounds();
  return { center, bounds };
};

const getFilteredAreas = (areas, type) => areas.filter(area => area.type === type);

const { REACT_APP_IS_MAPBOX_AVAILABLE } = process.env;

export const Map = ({ selectedArea, currentResult }) => {
  const [map, setMap] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [currentShape, setCurrentShape] = useState();
  const [drawingShape, setDrawingShape] = useState();

  const initialAreas = useSelector(selectAreasList);
  const currentAreaId = useSelector(selectCurrentArea);
  const sidebarMode = useSelector(selectSidebarMode);
  const isLoading = useSelector(getLoading);
  const selectedResults = useSelector(getSelectedResults);
  const { addNewArea, setCurrentArea, setSidebarMode, deleteSelectedResult } =
    useAreasActions();

  const isShowRange = selectedResults.length;
  const aoiType = sidebarMode === FIELDS ? AOI_TYPE.FIELD : AOI_TYPE.AREA;
  const areaData = useAreaData(currentShape, aoiType);
  const PopupHeaderText = `Are you sure with this ${
    aoiType === AOI_TYPE.AREA ? 'area' : 'field'
  }?`;

  const filteredAreas = useMemo(() => {
    const isField = sidebarMode === FIELDS || selectedArea?.type === AOI_TYPE.FIELD;
    return getFilteredAreas(initialAreas, isField ? AOI_TYPE.FIELD : AOI_TYPE.AREA);
  }, [sidebarMode, initialAreas, selectedArea]);

  useEffect(() => {
    if (map && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        map.panTo([position.coords.latitude, position.coords.longitude]);
      });
    }
  }, [map]);

  useEffect(() => {
    if (selectedResults.length || !selectedArea) return;

    const { center, bounds } = getShapePositions(selectedArea);
    if (isNaN(center.lat)) {
      map?.panTo(bounds._northEast).fitBounds(bounds);
    } else {
      map?.panTo(center).fitBounds(bounds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectedResults, currentAreaId]);

  useMapEvents(map, setIsPopupVisible, setCurrentShape);
  useMapRequests(selectedArea, map);

  useEffect(() => {
    return areasEvents.onCreateShape(({ json, isShowPopup, shapeType }) => {
      if (json) {
        const shapeType = json.features?.[0].geometry.type ?? json.geometry.type;
        if (shapeType !== SHAPE_NAMES.POLYGON) throw Error(NOT_POLYGON);

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
        const shape = new L.Draw[shapeType](map, {
          shapeOptions: SHAPE_OPTIONS,
          metric: ['km']
        });
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
    map.removeLayer(currentShape);
    await addNewArea(areaData);
    setSidebarMode(EDIT);
  };

  const handlePolygonClick = id => polygon => {
    if (!currentAreaId) {
      setCurrentArea(id);
    }
    if (id === currentAreaId || !selectedArea) return;
    setSidebarMode(selectedArea.type === AOI_TYPE.AREA ? AREAS : FIELDS);
    setCurrentArea(id);
    deleteSelectedResult();
    map.panTo(polygon.getCenter()).fitBounds(polygon.getBounds());
  };

  const getPolygonIndex = () =>
    filteredAreas.indexOf(filteredAreas.find(a => a.id === currentAreaId));

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
        {REACT_APP_IS_MAPBOX_AVAILABLE ? (
          <TileLayer
            attribution='Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
            url='/tiles/mapbox/{z}/{x}/{y}.png'
            tileSize={512}
            maxZoom={17}
            zoomOffset={-1}
          />
        ) : (
          <TileLayer
            attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors'>OpenStreetMap</a>"
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
        )}
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
        {!!filteredAreas.length &&
          filteredAreas.map(area => (
            <MapPolygon
              key={area.id}
              id={area.id}
              currentAreaId={currentAreaId}
              map={map}
              coordinates={getPolygonPositions(area).coordinates[0]}
              onClick={handlePolygonClick(area.id)}
              isEditable={sidebarMode === EDIT && area.id === currentAreaId}
              currentAreaIndex={getPolygonIndex()}
              selectedResult={currentResult}
            />
          ))}
        {isLoading && <Spinner />}
      </StyledMapContainer>
      {map ? <MapControls map={map} /> : null}
      {map && !!currentResult?.colormap ? (
        <MapColorBar colorMap={JSON.parse(currentResult.colormap)} />
      ) : null}
      {map && isShowRange ? <MapRange /> : null}
      {isPopupVisible && (
        <Popup
          header={PopupHeaderText}
          confirmPopup='Choose this selection'
          cancel={handleCancelSaveShape}
          save={handleSaveShape}
        />
      )}
    </MapHolder>
  );
};
