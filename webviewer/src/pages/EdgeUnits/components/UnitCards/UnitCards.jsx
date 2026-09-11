import React, { useMemo } from 'react';
import { formatRelativeTime } from 'utils';
import { STATE_LABELS } from '../../constants';
import {
  Strip,
  Card,
  UnitId,
  MachineLabel,
  LastMessage,
  StateRow,
  Dot,
  StateLabel,
  MessageCount,
  Coords,
  EmptyMessage
} from './UnitCards.styles';

const NO_DATA = 'no data';

export const cardDataForUnit = (telemetryUnit, now = new Date()) => {
  const hasWindowData = Boolean(telemetryUnit?.totals?.messages > 0);
  const messageCount = telemetryUnit?.totals?.messages ?? 0;

  return {
    lastMessageText: hasWindowData
      ? formatRelativeTime(telemetryUnit.totals.last_at, now)
      : NO_DATA,
    messageCount
  };
};

const formatCoords = (lat, lng) =>
  lat == null || lng == null ? NO_DATA : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

export const UnitCards = ({
  units,
  telemetryUnits,
  stateByUnitId,
  selectedUnitId,
  onSelectUnit,
  now
}) => {
  const telemetryByUnitId = useMemo(
    () => new Map((telemetryUnits ?? []).map(unit => [unit.unit_id, unit])),
    [telemetryUnits]
  );

  if (units.length === 0) {
    return <EmptyMessage>No units match this filter.</EmptyMessage>;
  }

  return (
    <Strip>
      {units.map(unit => {
        const state = stateByUnitId[unit.unit_id];
        const { lastMessageText, messageCount } = cardDataForUnit(
          telemetryByUnitId.get(unit.unit_id),
          now
        );
        const isSelected = unit.unit_id === selectedUnitId;

        return (
          <Card
            key={unit.unit_id}
            type='button'
            aria-pressed={isSelected}
            onClick={() => onSelectUnit(unit.unit_id)}
          >
            <UnitId>{unit.unit_id}</UnitId>
            <MachineLabel>{unit.machine_label}</MachineLabel>
            <LastMessage $state={state}>{lastMessageText}</LastMessage>
            <StateRow>
              <Dot $state={state} />
              <StateLabel>{STATE_LABELS[state]}</StateLabel>
              <MessageCount>{messageCount.toLocaleString()} messages</MessageCount>
            </StateRow>
            <Coords>{formatCoords(unit.last_lat, unit.last_lng)}</Coords>
          </Card>
        );
      })}
    </Strip>
  );
};
