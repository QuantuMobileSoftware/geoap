import React, { useMemo, useState } from 'react';
import { DATE_TYPES } from '_constants';
import { SEASONS, SEASON_DATES, WINTER_TEXT, SUMMER_TEXT, getSeasonList } from './utils';
import { StyledSelect, StyledDayPicker } from './PeriodSelect.styles';

export const PeriodSelect = props => {
  const { notebook, startDate, endDate, setStartDate, setEndDate } = props;

  const [year, setYear] = useState(new Date().getFullYear());
  const [season, setSeason] = useState();

  const START_YEAR = 2015;
  const MIN_DATE = new Date(START_YEAR, 0, 1);

  const seasonList = useMemo(() => getSeasonList(START_YEAR), []);

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
          items={START_YEAR}
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
          />
          <StyledDayPicker
            placeholderText='To'
            selected={endDate}
            onChange={setEndDate}
            minDate={MIN_DATE}
            maxDate={Date.now()}
          />
        </>
      );
  }
};
