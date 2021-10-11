import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import 'leaflet.vectorgrid';
import { last } from 'lodash';
import { getSelectedResults, getLayerOpacity, useAreasActions } from 'state';
import { API } from 'api';
import {
  EDITABLE_SHAPE_OPTIONS,
  SHAPE_OPTIONS,
  FILL_OPACITY,
  MODAL_TYPE,
  NO_DATA,
  SIDEBAR_MODE
} from '_constants';
import { areasEvents } from '_events';
import { getPolygonPositions } from 'utils';

export const useMapRequests = (selectedArea, map) => {
  const { addNewArea, setSidebarMode } = useAreasActions();
  const results = useSelector(getSelectedResults);
  const opacity = useSelector(getLayerOpacity);
  const [renderedLayers, setRenderedLayers] = useState([]);
  const [prevRenderedLayers, setPrevRenderedLayers] = useState([]);

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
        map.addLayer(layer);
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
              if (layer.setStyle) {
                layer.setStyle(EDITABLE_SHAPE_OPTIONS);
              }
              selectedLeafletLayer = layer;
              if (feature.properties.label !== NO_DATA) {
                areasEvents.toggleModal(true, {
                  type: MODAL_TYPE.SAVE_FIELD,
                  coordinates: layer
                });
              }
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
          maxZoom: 16,
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
              return properties.style;
            }
          },
          interactive: true
        });
        layer.addEventListener('click', async e => {
          console.log('latlng', e.latlng, selectedLayer); //send to server
          const polygon = await API.areas.getField(
            selectedLayer.id,
            JSON.stringify(e.latlng)
          );
          addNewArea(getPolygonPositions(polygon).coordinates[0]);
          setSidebarMode(SIDEBAR_MODE.EDIT);
        });
        addLayerInMap(layer, selectedLayer);
      } else if (selectedLayer.layer_type === 'XYZ') {
        layer = L.tileLayer(selectedLayer.rel_url, {
          minZoom: 10,
          maxZoom: 16
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
    addNewArea,
    setSidebarMode
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
