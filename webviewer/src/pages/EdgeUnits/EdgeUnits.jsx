import React, { useState } from 'react';
import { Header as PageHeader } from 'components/Header';
import { Skeleton } from 'components/_shared/Skeleton';
import { Button } from 'components/_shared/Button';
import { AccountClock } from 'components/_shared/AccountClock';
import { useGetUnitsQuery, useGetUnitsTelemetryQuery } from 'state';
import {
  ClockRow,
  PageContainer,
  StatusLine,
  ChipsRow,
  DayBar,
  UnitCardsStrip,
  MapArea,
  TimelineStrip,
  DetailPanel,
  CardsSkeletonRow,
  RetryRow
} from './EdgeUnits.styles';

const POLLING_INTERVAL_MS = 30000;

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
  // FE-06 will replace this with the day bar's actual selection state.
  const [windowArgs] = useState({ rolling: true });

  const {
    isLoading: isUnitsLoading,
    isError: isUnitsError,
    refetch: refetchUnits
  } = useGetUnitsQuery();

  const {
    isLoading: isTelemetryLoading,
    isError: isTelemetryError,
    refetch: refetchTelemetry
  } = useGetUnitsTelemetryQuery(windowArgs, { pollingInterval: POLLING_INTERVAL_MS });

  return (
    <div>
      <PageHeader />
      {/* FE-04 will move this into the page's own header/status line */}
      <ClockRow>
        <AccountClock />
      </ClockRow>
      <PageContainer>
        <StatusLine data-testid='status-line'>
          <Section
            isLoading={isUnitsLoading}
            isError={isUnitsError}
            onRetry={refetchUnits}
            skeleton={<Skeleton height='20px' />}
          >
            {/* FE-04: status line */}
          </Section>
        </StatusLine>
        <ChipsRow data-testid='filter-chips'>
          <Section
            isLoading={isUnitsLoading}
            isError={isUnitsError}
            onRetry={refetchUnits}
            skeleton={<Skeleton height='24px' width='240px' />}
          >
            {/* FE-05: filter chips */}
          </Section>
        </ChipsRow>
        <DayBar data-testid='day-bar'>
          <Section
            isLoading={isUnitsLoading}
            isError={isUnitsError}
            onRetry={refetchUnits}
            skeleton={<Skeleton height='32px' />}
          >
            {/* FE-06: day bar */}
          </Section>
        </DayBar>
        <UnitCardsStrip data-testid='unit-cards'>
          <Section
            isLoading={isUnitsLoading}
            isError={isUnitsError}
            onRetry={refetchUnits}
            skeleton={
              <CardsSkeletonRow>
                <Skeleton height='90px' width='160px' />
                <Skeleton height='90px' width='160px' />
                <Skeleton height='90px' width='160px' />
              </CardsSkeletonRow>
            }
          >
            {/* FE-07: unit cards */}
          </Section>
        </UnitCardsStrip>
        <MapArea data-testid='map-area'>
          <Section
            isLoading={isTelemetryLoading}
            isError={isTelemetryError}
            onRetry={refetchTelemetry}
            skeleton={<Skeleton />}
          >
            {/* FE-08: map */}
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
