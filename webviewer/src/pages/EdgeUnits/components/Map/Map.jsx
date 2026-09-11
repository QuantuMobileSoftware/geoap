import React, { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { formatAccountDay } from 'utils';
import { SatelliteTileLayer, TILE_MODES } from 'components/Map/SatelliteTileLayer';
import { UnitTrack } from './components';
import { TrackMarkerGlobalStyle } from './components/UnitTrack/UnitTrack.styles';
import {
  MapHolder,
  StyledMapContainer,
  Toolbar,
  ToolbarButton,
  EmptyBanner
} from './Map.styles';

const DEFAULT_CENTER = [49.8, -98.3];
const DEFAULT_ZOOM = 10;

// Empty can mean "filter matched nothing" or "no telemetry this window" - different copy for each.
export const getMapEmptyMessage = ({
  unitCount,
  unitsWithTrackCount,
  rolling,
  resolvedDay
}) => {
  if (unitCount === 0) return 'No units match this filter.';
  if (unitsWithTrackCount > 0) return null;
  return rolling
    ? 'No telemetry in the last 24 hours. The units may be powered off.'
    : `Nothing recorded on ${formatAccountDay(
        resolvedDay
      )}. Pick another day, or check that the units were powered on.`;
};

// Only refits on fitTrigger (day/rolling/manual click), not on poll refreshes.
const MapController = ({ points, fitTrigger }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    // Re-measure in case the container size was stale on mount.
    map.invalidateSize();
    map.fitBounds(L.latLngBounds(points).pad(0.3));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitTrigger]);

  return null;
};

export const UnitsMap = ({
  units,
  telemetryUnits,
  stateByUnitId,
  selectedUnitId,
  onSelectUnit,
  timezone,
  resolvedDay,
  rolling
}) => {
  const [baseMode, setBaseMode] = useState(TILE_MODES.SATELLITE);
  const [showImagePoints, setShowImagePoints] = useState(false);
  const [manualFitCount, setManualFitCount] = useState(0);

  const telemetryByUnitId = useMemo(
    () => new Map((telemetryUnits ?? []).map(unit => [unit.unit_id, unit])),
    [telemetryUnits]
  );

  const unitsWithTrack = units.filter(
    unit => telemetryByUnitId.get(unit.unit_id)?.track?.length
  );

  const allPoints = useMemo(
    () =>
      unitsWithTrack.flatMap(unit =>
        telemetryByUnitId.get(unit.unit_id).track.map(point => [point.lat, point.lng])
      ),
    [unitsWithTrack, telemetryByUnitId]
  );

  const fitTrigger = `${resolvedDay}|${rolling}|${manualFitCount}`;
  const isSatellite = baseMode === TILE_MODES.SATELLITE;

  const emptyMessage = getMapEmptyMessage({
    unitCount: units.length,
    unitsWithTrackCount: unitsWithTrack.length,
    rolling,
    resolvedDay
  });

  return (
    <MapHolder>
      <TrackMarkerGlobalStyle />
      <StyledMapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom>
        <SatelliteTileLayer mode={baseMode} />
        <MapController points={allPoints} fitTrigger={fitTrigger} />
        {unitsWithTrack.map(unit => (
          <UnitTrack
            key={unit.unit_id}
            unit={unit}
            telemetryUnit={telemetryByUnitId.get(unit.unit_id)}
            state={stateByUnitId[unit.unit_id]}
            isSelected={unit.unit_id === selectedUnitId}
            isSatellite={isSatellite}
            showImagePoints={showImagePoints}
            timezone={timezone}
            onSelect={onSelectUnit}
          />
        ))}
      </StyledMapContainer>

      <Toolbar>
        <ToolbarButton
          type='button'
          aria-pressed={isSatellite}
          onClick={() =>
            setBaseMode(isSatellite ? TILE_MODES.STREETS : TILE_MODES.SATELLITE)
          }
        >
          Satellite
        </ToolbarButton>
        <ToolbarButton
          type='button'
          aria-pressed={showImagePoints}
          onClick={() => setShowImagePoints(value => !value)}
        >
          Image points
        </ToolbarButton>
        <ToolbarButton
          type='button'
          onClick={() => setManualFitCount(count => count + 1)}
        >
          Fit track
        </ToolbarButton>
      </Toolbar>

      {emptyMessage && <EmptyBanner>{emptyMessage}</EmptyBanner>}
    </MapHolder>
  );
};
