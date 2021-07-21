import React, { useState, useRef, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import {
  ApplyButton,
  StyledDatePicker,
  StyledIcon,
  StyledCalendarContainer,
  CalendarDay,
  CalendarTitle
} from './Calendar.styles';

const CalendarInput = forwardRef(({ value, onClick, open }, ref) => {
  return (
    <StyledDatePicker onClick={onClick} ref={ref}>
      <StyledIcon open={open}>ExpandDown</StyledIcon>
      {value ? value : 'DD/MM/YYYY - DD/MM/YYYY'}
    </StyledDatePicker>
  );
});

const renderDayContents = day => {
  return (
    <CalendarDay>
      <span>{day}</span>
    </CalendarDay>
  );
};

export const Calendar = ({ startDate, endDate, setStartDate, setEndDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef(null);

  const handleOnChange = dates => {
    const [startDate, endDate] = dates;
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const CalendarContainer = ({ children }) => {
    return (
      <StyledCalendarContainer>
        <div>{children}</div>
        <ApplyButton variant='primary' onClick={() => calendarRef.current.setOpen(false)}>
          apply
        </ApplyButton>
      </StyledCalendarContainer>
    );
  };

  return (
    <>
      <CalendarTitle>Date range</CalendarTitle>
      <DatePicker
        selected={startDate}
        onChange={handleOnChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        shouldCloseOnSelect={false}
        dateFormat='yyyy/MM/dd'
        customInput={<CalendarInput open={isOpen} />}
        onCalendarClose={() => setIsOpen(false)}
        onCalendarOpen={() => setIsOpen(true)}
        calendarContainer={CalendarContainer}
        ref={calendarRef}
        renderDayContents={renderDayContents}
      />
    </>
  );
};
