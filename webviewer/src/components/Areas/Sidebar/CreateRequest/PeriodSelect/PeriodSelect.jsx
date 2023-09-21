import React, { useMemo, useState } from 'react';
import { DATE_TYPES } from '_constants';
import {
  SEASONS,
  SEASON_DATES,
  WINTER_TEXT,
  SUMMER_TEXT,
  getSeasonList,
  getYearList
} from './utils';
import { StyledSelect, StyledDayPicker } from './PeriodSelect.styles';

export const PeriodSelect = props => {
  const { notebook, startDate, endDate, setStartDate, setEndDate, currentArea } = props;

  const [year, setYear] = useState(new Date().getFullYear());
  const [season, setSeason] = useState();

  const START_YEAR = 2015;
  const MIN_DATE = new Date(START_YEAR, 0, 1);

  const seasonList = useMemo(() => getSeasonList(START_YEAR), []);
  const yearList = useMemo(() => getYearList(START_YEAR), []);

  let highlightedDates = [];
  if (currentArea.sentinel_hub_available_dates) {
    if (
      notebook.sentinels.includes('Sentinel-1') &&
      notebook.sentinels.includes('Sentinel-2') &&
      currentArea.sentinel_hub_available_dates.hasOwnProperty('Sentinel-1') &&
      currentArea.sentinel_hub_available_dates.hasOwnProperty('Sentinel-2')
    ) {
      const intersectionFullCoverage = currentArea.sentinel_hub_available_dates[
        'Sentinel-1'
      ].full_coverage.filter(item =>
        currentArea.sentinel_hub_available_dates['Sentinel-2'].full_coverage.includes(
          item
        )
      );

      const intersectionPartlyCoverage = currentArea.sentinel_hub_available_dates[
        'Sentinel-1'
      ].partly_coverage.filter(item =>
        currentArea.sentinel_hub_available_dates['Sentinel-2'].partly_coverage.includes(
          item
        )
      );

      highlightedDates = {
        full_coverage: intersectionFullCoverage,
        partly_coverage: intersectionPartlyCoverage
      };
    } else if (
      notebook.sentinels.includes('Sentinel-1') &&
      currentArea.sentinel_hub_available_dates.hasOwnProperty('Sentinel-1')
    ) {
      highlightedDates = currentArea.sentinel_hub_available_dates['Sentinel-1'];
    } else if (
      notebook.sentinels.includes('Sentinel-2') &&
      currentArea.sentinel_hub_available_dates.hasOwnProperty('Sentinel-2')
    ) {
      highlightedDates = currentArea.sentinel_hub_available_dates['Sentinel-2'];
    }
  }

  const handleYearChange = item => {
    setYear(item.value);
    setStartDate(new Date(item.value, 0, 1));
    setEndDate(new Date(item.value, 11, 31));
  };
  const handleSeasonChange = data => {
    const [type, year] = data.value.split(' ');
    setStartDate(SEASON_DATES[SEASONS[type]](+year).start);
    setEndDate(SEASON_DATES[SEASONS[type]](+year).end);
    setSeason(data.value);
  };
  const handleDayChange = date => {
    setStartDate(date);
    setEndDate(date);
  };

  switch (notebook.date_type) {
    case DATE_TYPES.year:
      return (
        <StyledSelect
          items={yearList}
          onSelect={handleYearChange}
          label='Year'
          value={year}
        />
      );
    case DATE_TYPES.season: {
      const year = +season?.split(' ')[1];
      return (
        <>
          <StyledSelect
            items={seasonList}
            label='Season'
            value={season}
            onSelect={handleSeasonChange}
          />
          {season && (
            <p>
              {season.includes(SEASONS.summer) ? SUMMER_TEXT(year) : WINTER_TEXT(year)}
            </p>
          )}
        </>
      );
    }
    case DATE_TYPES.day:
      return (
        <StyledDayPicker
          title='Date'
          placeholderText='Choose'
          selected={startDate}
          onChange={handleDayChange}
          minDate={MIN_DATE}
          maxDate={Date.now()}
          highlightedDates={highlightedDates}
        />
      );
    default:
      return (
        <>
          <StyledDayPicker
            title='Date range'
            placeholderText='From'
            selected={startDate}
            onChange={setStartDate}
            minDate={MIN_DATE}
            maxDate={Date.now()}
            highlightedDates={highlightedDates}
          />
          <StyledDayPicker
            placeholderText='To'
            selected={endDate}
            onChange={setEndDate}
            minDate={MIN_DATE}
            maxDate={Date.now()}
            highlightedDates={highlightedDates}
          />
        </>
      );
  }
};
