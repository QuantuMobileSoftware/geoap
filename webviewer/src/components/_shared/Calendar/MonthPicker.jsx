import React, { useState, useRef, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { getTransactionDate } from 'utils';
import {
  ApplyButton,
  StyledDatePicker,
  StyledIcon,
  StyledMonthPickerContainer,
  CalendarDay,
  DatePickerWrapper
} from './Calendar.styles';

const CalendarInput = forwardRef(({ value, onClick, open }, ref) => {
  return (
    <StyledDatePicker onClick={onClick} ref={ref}>
      <StyledIcon open={open}>ExpandDown</StyledIcon>
      {value ? getTransactionDate(value) : 'Select month'}
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

export const MonthPicker = ({ selectedDate, onChange, onApply, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef(null);

  const handleOnToggle = () => setIsOpen(prev => !prev);

  const handleApply = () => {
    calendarRef.current.setOpen(false);
    onApply?.();
  };

  const CalendarContainer = ({ children }) => {
    return (
      <StyledMonthPickerContainer>
        <div>{children}</div>
        <ApplyButton variant='primary' onClick={handleApply}>
          apply
        </ApplyButton>
      </StyledMonthPickerContainer>
    );
  };

  return (
    <DatePickerWrapper>
      <DatePicker
        onChange={onChange}
        selected={selectedDate}
        shouldCloseOnSelect={false}
        customInput={<CalendarInput open={isOpen} />}
        onCalendarClose={handleOnToggle}
        onCalendarOpen={handleOnToggle}
        calendarContainer={CalendarContainer}
        ref={calendarRef}
        renderDayContents={renderDayContents}
        showMonthYearPicker
        {...props}
      />
    </DatePickerWrapper>
  );
};
