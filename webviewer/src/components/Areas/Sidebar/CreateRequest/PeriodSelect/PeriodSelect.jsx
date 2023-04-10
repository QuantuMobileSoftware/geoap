import React, { useMemo, useState } from 'react';
import { DATE_TYPES } from '_constants';
import { StyledSelect, StyledDayPicker } from './PeriodSelect.styles';

const SEASONS = {
  summer: 'summer',
  winter: 'winter'
};
const SEASON_DATES = {
  [SEASONS.summer]: year => ({ start: new Date(year, 3, 1), end: new Date(year, 9, 31) }),
  [SEASONS.winter]: year => ({ start: new Date(year, 10, 1), end: new Date(year, 2, 31) })
};

export const PeriodSelect = props => {
  const { notebook, startDate, endDate, setStartDate, setEndDate } = props;

  const [year, setYear] = useState(new Date().getFullYear());
  const [season, setSeason] = useState();

  const startYear = 2015;
  const minCalendarDate = new Date(startYear, 0, 1);
  const layerYears = useMemo(
    () =>
      Array.from({ length: new Date().getFullYear() - startYear + 1 }).map((el, i) => ({
        value: startYear + i,
        name: startYear + i
      })),
    []
  );
  const SeasonList = useMemo(
    () =>
      layerYears.reduce((seasons, item) => {
        const year = item.value;
        seasons.push({
          value: `${SEASONS.summer} ${year}`,
          name: `Summer ${year}`
        });
        seasons.push({
          value: `${SEASONS.winter} ${year}`,
          name: `Winter ${year}`
        });
        return seasons;
      }, []),
    [layerYears]
  );

  const handleYearChange = item => {
    setYear(item.value);
    setStartDate(new Date(item.value, 0, 1));
    setEndDate(new Date(item.value, 11, 31));
  };
  const handleSeasonChange = data => {
    const [type, year] = data.value.split(' ');
    setStartDate(SEASON_DATES[SEASONS[type]](year).start);
    setEndDate(SEASON_DATES[SEASONS[type]](year).end);
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
          items={layerYears}
          onSelect={handleYearChange}
          label='Year'
          value={year}
        />
      );
    case DATE_TYPES.season:
      return (
        <>
          <StyledSelect
            items={SeasonList}
            label='Season'
            value={season}
            onSelect={handleSeasonChange}
          />
          {season && (
            <p>
              {season.includes(SEASONS.summer)
                ? 'Summer season - applies dates from April to November'
                : 'Winter season - applies dates from November to April'}
            </p>
          )}
        </>
      );
    case DATE_TYPES.day:
      return (
        <StyledDayPicker
          title='Date'
          placeholderText='Choose'
          selected={startDate}
          onChange={handleDayChange}
          minDate={minCalendarDate}
          maxDate={Date.now()}
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
            minDate={minCalendarDate}
            maxDate={Date.now()}
          />
          <StyledDayPicker
            placeholderText='To'
            selected={endDate}
            onChange={setEndDate}
            minDate={minCalendarDate}
            maxDate={Date.now()}
          />
        </>
      );
  }
};
