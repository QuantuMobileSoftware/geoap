import React from 'react';
import { TileLayer } from 'react-leaflet';

export const TILE_MODES = { SATELLITE: 'satellite', STREETS: 'streets' };

const { REACT_APP_IS_MAPBOX_AVAILABLE } = process.env;

// Without the flag, every mode falls back to OpenStreetMap.
export const isSatelliteModeAvailable = () => Boolean(REACT_APP_IS_MAPBOX_AVAILABLE);

export const SatelliteTileLayer = ({ mode = TILE_MODES.SATELLITE }) =>
  mode === TILE_MODES.SATELLITE && isSatelliteModeAvailable() ? (
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
  );
