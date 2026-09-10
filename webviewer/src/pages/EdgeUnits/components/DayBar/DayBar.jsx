import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Icon } from 'components/_shared/Icon';
import { formatAccountDay } from 'utils';
import {
  Container,
  Eyebrow,
  ArrowGroup,
  ArrowButton,
  ToggleGroup,
  ToggleButton,
  StyledDateButton,
  DayLabel
} from './DayBar.styles';

// Local calendar components only, so the picker never jumps a day.
const dateToIso = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isoToDate = iso => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const DateButton = forwardRef(({ value, onClick, disabled }, ref) => (
  <StyledDateButton type='button' ref={ref} onClick={onClick} disabled={disabled}>
    {value}
  </StyledDateButton>
));

export const DayBar = ({
  day,
  today,
  rolling,
  onPrevDay,
  onNextDay,
  onSelectDay,
  onToday,
  onToggleRolling
}) => {
  const isToday = day === today;
  const label = rolling
    ? 'rolling 24 hours'
    : isToday
    ? `today · ${formatAccountDay(day)}`
    : formatAccountDay(day);

  return (
    <Container>
      <Eyebrow>Showing</Eyebrow>

      <ArrowGroup>
        <ArrowButton
          type='button'
          onClick={onPrevDay}
          disabled={rolling}
          aria-label='Previous day'
        >
          <Icon>ExpandLeft</Icon>
        </ArrowButton>
        <ArrowButton
          type='button'
          onClick={onNextDay}
          disabled={rolling || isToday}
          aria-label='Next day'
        >
          <Icon>ExpandRight</Icon>
        </ArrowButton>
      </ArrowGroup>

      <DatePicker
        selected={isoToDate(day)}
        onChange={date => date && onSelectDay(dateToIso(date))}
        maxDate={isoToDate(today)}
        disabled={rolling}
        dateFormat='yyyy-MM-dd'
        customInput={<DateButton />}
        aria-label='Choose a day'
      />

      <ToggleGroup>
        <ToggleButton type='button' onClick={onToday}>
          Today
        </ToggleButton>
        <ToggleButton type='button' aria-pressed={rolling} onClick={onToggleRolling}>
          Last 24 h
        </ToggleButton>
      </ToggleGroup>

      <DayLabel>{label}</DayLabel>
    </Container>
  );
};
