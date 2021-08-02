import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import 'leaflet.vectorgrid';
import { selectSelectedResults } from 'state';
import { EDITABLE_SHAPE_OPTIONS, SHAPE_OPTIONS } from '_constants';
import { getPolygonPositions } from 'utils';

export const useMapRequests = (selectedArea, map) => {
  const results = useSelector(selectSelectedResults);
  const [renderedLayers, setRenderedLayers] = useState([]);

  useEffect(() => {
    const selectedResults = [];
    results.forEach(id => {
      const result = selectedArea.results.find(result => result.id === id);
      if (result) {
        selectedResults.push(result);
      }
    });

    if (selectedResults.length < renderedLayers.length) {
      let deletedLayer;
      const filteredLayers = renderedLayers.filter(rendered => {
        if (selectedResults.some(l => l.id === rendered.id)) {
          return rendered;
        } else {
          deletedLayer = rendered;
        }
      });
      setRenderedLayers(filteredLayers);
      map.removeLayer(deletedLayer.layer);
    }

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
          if (!renderedLayers.some(l => l.id === selectedLayer.id)) {
            map.addLayer(layer);
            setRenderedLayers([...renderedLayers, { id: selectedLayer.id, layer }]);
          }
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
        if (!renderedLayers.some(l => l.id === selectedLayer.id)) {
          map.addLayer(layer);
          setRenderedLayers([...renderedLayers, { id: selectedLayer.id, layer }]);
        }
      } else if (selectedLayer.layer_type === 'XYZ') {
        layer = L.tileLayer(selectedLayer.rel_url, {
          minZoom: 10,
          maxZoom: 16
        });
        if (!renderedLayers.some(l => l.id === selectedLayer.id)) {
          map.addLayer(layer);
          setRenderedLayers([...renderedLayers, { id: selectedLayer.id, layer }]);
        }
      }

      const lastId = renderedLayers[renderedLayers.length - 1]?.id;
      if (lastId) {
        const layer = selectedResults.find(l => l.id === lastId);
        if (layer) {
          map.fitBounds(
            getPolygonPositions({ polygon: layer.bounding_polygon }).coordinates[0]
          );
        }
      }
    });
  }, [map, selectedArea, results, renderedLayers]);
};
