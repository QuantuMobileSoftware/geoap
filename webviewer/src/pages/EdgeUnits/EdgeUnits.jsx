import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Header as PageHeader } from 'components/Header';
import { Skeleton } from 'components/_shared/Skeleton';
import { Button } from 'components/_shared/Button';
import { useGetUnitsQuery, useGetUnitsTelemetryQuery, selectUserTimezone } from 'state';
import { useFleetStatus } from 'hooks';
import { getAccountToday, shiftDate } from 'utils';
import {
  AccountHeader,
  FleetStatus,
  FilterChips,
  DayBar,
  UnitCards,
  UnitsMap
} from './components';
import {
  PageContainer,
  StatusLine,
  ChipsRow,
  DayBarRow,
  UnitCardsStrip,
  MapArea,
  TimelineStrip,
  DetailPanel,
  CardsSkeletonRow,
  RetryRow
} from './EdgeUnits.styles';

const POLLING_INTERVAL_MS = 30000;
const MIN_UNITS_FOR_CHIPS = 6;

const Section = ({ isLoading, isError, onRetry, skeleton, children }) => {
  if (isLoading) return skeleton;
  if (isError) {
    return (
      <RetryRow>
        <span>Failed to load.</span>
        <Button onClick={onRetry}>Retry</Button>
      </RetryRow>
    );
  }
  return children ?? null;
};

export const EdgeUnits = () => {
  const timezone = useSelector(selectUserTimezone);
  const today = timezone ? getAccountToday(timezone) : null;

  const [day, setDay] = useState(null);
  const [rolling, setRolling] = useState(true);
  const [stateFilter, setStateFilter] = useState('all');
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  const resolvedDay = day ?? today;
  const windowArgs = rolling ? { rolling: true } : { day: resolvedDay };

  const {
    data: unitsData,
    isLoading: isUnitsLoading,
    isError: isUnitsError,
    refetch: refetchUnits
  } = useGetUnitsQuery();

  const {
    data: telemetryData,
    isLoading: isTelemetryLoading,
    isError: isTelemetryError,
    refetch: refetchTelemetry
  } = useGetUnitsTelemetryQuery(windowArgs, {
    skip: !rolling && !resolvedDay,
    pollingInterval: rolling || resolvedDay === today ? POLLING_INTERVAL_MS : 0
  });

  const fleetStatus = useFleetStatus(unitsData?.units, telemetryData?.units);

  const visibleUnits = useMemo(
    () =>
      (unitsData?.units ?? []).filter(
        unit =>
          stateFilter === 'all' || fleetStatus.stateByUnitId[unit.unit_id] === stateFilter
      ),
    [unitsData, stateFilter, fleetStatus.stateByUnitId]
  );

  // Don't leave a filter active once the chip row that set it is hidden.
  useEffect(() => {
    if (fleetStatus.counts.all < MIN_UNITS_FOR_CHIPS && stateFilter !== 'all') {
      setStateFilter('all');
    }
  }, [fleetStatus.counts.all, stateFilter]);

  // Reset selection if it's no longer in visibleUnits.
  useEffect(() => {
    if (visibleUnits.some(unit => unit.unit_id === selectedUnitId)) return;
    setSelectedUnitId(visibleUnits[0]?.unit_id ?? null);
  }, [visibleUnits, selectedUnitId]);

  const handleRetryOverview = () => {
    refetchUnits();
    refetchTelemetry();
  };

  const handlePrevDay = () => {
    setRolling(false);
    setDay(shiftDate(resolvedDay, -1));
  };

  const handleNextDay = () => {
    if (rolling || resolvedDay >= today) return;
    setRolling(false);
    setDay(shiftDate(resolvedDay, 1));
  };

  const handleSelectDay = iso => {
    setRolling(false);
    setDay(iso);
  };

  const handleToday = () => {
    setRolling(false);
    setDay(today);
  };

  const handleToggleRolling = () => setRolling(value => !value);

  return (
    <div>
      <PageHeader />
      <PageContainer>
        <AccountHeader />
        <StatusLine data-testid='status-line'>
          <Section
            isLoading={isUnitsLoading || isTelemetryLoading}
            isError={isUnitsError || isTelemetryError}
            onRetry={handleRetryOverview}
            skeleton={<Skeleton height='20px' />}
          >
            <FleetStatus fleetStatus={fleetStatus} />
          </Section>
        </StatusLine>
        <ChipsRow data-testid='filter-chips'>
          <Section
            isLoading={isUnitsLoading || isTelemetryLoading}
            isError={isUnitsError || isTelemetryError}
            onRetry={handleRetryOverview}
            skeleton={<Skeleton height='24px' width='240px' />}
          >
            <FilterChips
              counts={fleetStatus.counts}
              stateFilter={stateFilter}
              onChangeFilter={setStateFilter}
            />
          </Section>
        </ChipsRow>
        <DayBarRow data-testid='day-bar'>
          <Section
            isLoading={isUnitsLoading || !today}
            isError={isUnitsError}
            onRetry={refetchUnits}
            skeleton={<Skeleton height='32px' />}
          >
            <DayBar
              day={resolvedDay}
              today={today}
              rolling={rolling}
              onPrevDay={handlePrevDay}
              onNextDay={handleNextDay}
              onSelectDay={handleSelectDay}
              onToday={handleToday}
              onToggleRolling={handleToggleRolling}
            />
          </Section>
        </DayBarRow>
        <UnitCardsStrip data-testid='unit-cards'>
          <Section
            isLoading={isUnitsLoading || isTelemetryLoading}
            isError={isUnitsError || isTelemetryError}
            onRetry={handleRetryOverview}
            skeleton={
              <CardsSkeletonRow>
                <Skeleton height='90px' width='160px' />
                <Skeleton height='90px' width='160px' />
                <Skeleton height='90px' width='160px' />
              </CardsSkeletonRow>
            }
          >
            <UnitCards
              units={visibleUnits}
              telemetryUnits={telemetryData?.units}
              stateByUnitId={fleetStatus.stateByUnitId}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
            />
          </Section>
        </UnitCardsStrip>
        <MapArea data-testid='map-area'>
          <Section
            isLoading={isUnitsLoading || isTelemetryLoading}
            isError={isUnitsError || isTelemetryError}
            onRetry={handleRetryOverview}
            skeleton={<Skeleton height='360px' />}
          >
            <UnitsMap
              units={visibleUnits}
              telemetryUnits={telemetryData?.units}
              stateByUnitId={fleetStatus.stateByUnitId}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
              timezone={timezone}
              resolvedDay={resolvedDay}
              rolling={rolling}
            />
          </Section>
        </MapArea>
        <TimelineStrip data-testid='timeline-strip'>
          <Section
            isLoading={isTelemetryLoading}
            isError={isTelemetryError}
            onRetry={refetchTelemetry}
            skeleton={<Skeleton />}
          >
            {/* FE-09/FE-10/FE-11: timeline strip, brushing, summary row */}
          </Section>
        </TimelineStrip>
        <DetailPanel data-testid='detail-panel'>
          <Section
            isLoading={isTelemetryLoading}
            isError={isTelemetryError}
            onRetry={refetchTelemetry}
            skeleton={<Skeleton />}
          >
            {/* FE-12/FE-13: detail panel, latest image */}
          </Section>
        </DetailPanel>
      </PageContainer>
    </div>
  );
};
