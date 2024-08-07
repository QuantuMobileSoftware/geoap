import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import 'leaflet.vectorgrid';
import { last } from 'lodash';
import {
  getSelectedResults,
  getLayerOpacity,
  useAreasActions,
  selectUser,
  selectAreasList,
  useChartActions
} from 'state';
import { API } from 'api';
import {
  SHAPE_OPTIONS,
  FILL_OPACITY,
  MODAL_TYPE,
  AOI_TYPE,
  SIDEBAR_MODE
} from '_constants';
import { areasEvents } from '_events';
import { getPolygonPositions, getNewAreaNumber } from 'utils';

export const useMapRequests = (selectedArea, map) => {
  const { addNewArea, deleteSelectedResult, setSidebarMode } = useAreasActions();
  const { setChartData } = useChartActions();
  const results = useSelector(getSelectedResults);
  const opacity = useSelector(getLayerOpacity);
  const currentUser = useSelector(selectUser);
  const initialAreas = useSelector(selectAreasList);
  const [renderedLayers, setRenderedLayers] = useState([]);
  const [prevRenderedLayers, setPrevRenderedLayers] = useState([]);

  const createField = useCallback(
    coords => ({
      user: currentUser.pk,
      name: `New field ${getNewAreaNumber(initialAreas, AOI_TYPE.FIELD)}`,
      polygon: coords,
      type: 2
    }),
    [currentUser, initialAreas]
  );

  const addNewField = useCallback(
    polygon => {
      setSidebarMode(SIDEBAR_MODE.REPORTS);
      addNewArea(polygon);
      deleteSelectedResult();
      areasEvents.toggleSidebar(true);
      areasEvents.toggleModal(true, {
        type: MODAL_TYPE.SAVE_FIELD,
        prevArea: selectedArea.id
      });
    },
    [deleteSelectedResult, selectedArea, setSidebarMode, addNewArea]
  );

  useEffect(() => {
    const selectedResults = [];
    results.forEach(id => {
      const result = selectedArea?.results.find(result => result.id === id);
      if (result) {
        selectedResults.push(result);
      }
    });

    if (selectedResults.length < renderedLayers.length) {
      const deletedLayers = [];
      const filteredLayers = renderedLayers.filter(rendered => {
        if (selectedResults.some(l => l.id === rendered.id)) {
          return rendered;
        } else {
          deletedLayers.push(rendered);
        }
      });
      setRenderedLayers(filteredLayers);
      deletedLayers.forEach(l => map.removeLayer(l.layer));
    }

    const addLayerInMap = (layer, selectedLayer) => {
      if (!renderedLayers.some(l => l.id === selectedLayer.id)) {
        map?.addLayer(layer);
        setRenderedLayers([...renderedLayers, { id: selectedLayer.id, layer }]);
      }
    };

    selectedResults.forEach(async selectedLayer => {
      let layer = null;
      let selectedLeafletLayer = null;
      let layerStyle = null;

      if (selectedLayer.layer_type === 'GEOJSON') {
        layer = L.geoJSON(undefined, {
          style: feature => {
            layerStyle = feature.properties.style;
            return feature.properties.style;
          },
          onEachFeature: (feature, layer) => {
            layer.addEventListener('click', () => {
              if (selectedLeafletLayer != null && selectedLeafletLayer.setStyle) {
                selectedLeafletLayer.setStyle(layerStyle ?? SHAPE_OPTIONS);
              }
              selectedLeafletLayer = layer;
              // if (feature.properties.label !== NO_DATA) { // TODO: add later with other design
              //   addNewField(createField(getShapePositionsString(layer)));
              // }
              const chartData = feature.properties.data ?? null;
              const chartLayout = feature.properties.layout ?? null;
              setChartData({ data: chartData, layout: chartLayout });
            });
            if (feature.properties.label) {
              layer.bindPopup(feature.properties.label);
            }
          }
        });
        const resp = await fetch(selectedLayer.rel_url);
        if (resp.ok) {
          const jsonResponse = await resp.json();
          layer.addData(jsonResponse);
          addLayerInMap(layer, selectedLayer);
        } else {
          console.error(`Error: ${resp.status} ${resp.statusText}`);
        }
      } else if (selectedLayer.layer_type === 'MVT') {
        layer = L.vectorGrid.protobuf(selectedLayer.rel_url, {
          rendererFactory: L.canvas.tile,
          maxZoom: 17,
          vectorTileLayerStyles: {
            default: properties => {
              if (typeof properties.style === 'string') {
                properties.style = JSON.parse(properties.style);
              }
              if (typeof properties.data === 'string') {
                properties.data = JSON.parse(properties.data);
              }
              if (typeof properties.layout === 'string') {
                properties.layout = JSON.parse(properties.layout);
              }
              if (properties.style === undefined) {
                properties.style = {};
              }
              if (properties.style.fill === undefined) {
                properties.style.fill = true;
              }
              // Set radius for styling, must be > 10
              properties.style.radius = 12;
              return properties.style;
            }
          },
          interactive: true
        });
        layer.addEventListener('click', async e => {
          const coords = { lat: e.latlng.lng, lng: e.latlng.lat };
          const resp = await API.areas.getField(selectedLayer.id, coords);
          addNewField(createField(resp.data.polygon));
        });
        addLayerInMap(layer, selectedLayer);
      } else if (selectedLayer.layer_type === 'XYZ') {
        layer = L.tileLayer(selectedLayer.rel_url, {
          minZoom: 10,
          maxZoom: 17
        });
        addLayerInMap(layer, selectedLayer);
      }

      if (prevRenderedLayers.length === renderedLayers.length) {
        return;
      }
      setPrevRenderedLayers(renderedLayers);
      const lastId = last(renderedLayers)?.id;
      if (lastId) {
        const layer = selectedResults.find(l => l.id === lastId);
        if (layer) {
          map.fitBounds(
            getPolygonPositions({ polygon: layer.bounding_polygon }).coordinates[0]
          );
        }
      }
    });
  }, [
    map,
    selectedArea,
    results,
    renderedLayers,
    prevRenderedLayers,
    createField,
    addNewField,
    setChartData
  ]);

  useEffect(() => {
    const selectedLayer = last(renderedLayers);
    if (selectedLayer) {
      const fillOpacity = opacity / (1 / FILL_OPACITY);
      if (selectedLayer.layer.setStyle) {
        selectedLayer.layer.setStyle({ opacity, fillOpacity });
      } else {
        selectedLayer.layer.setOpacity(opacity);
      }
    }
  }, [renderedLayers, opacity]);
};
