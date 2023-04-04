import React, { useRef } from 'react';
import DatePicker from 'react-datepicker';
import {
  ApplyButton,
  DayPickerWrapper,
  StyledCalendarContainer,
  CalendarDay,
  CalendarTitle
} from './Calendar.styles';

const renderDayContents = day => {
  return (
    <CalendarDay>
      <span>{day}</span>
    </CalendarDay>
  );
};

export const DayPicker = ({ title, ...props }) => {
  const calendarRef = useRef(null);

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
    <DayPickerWrapper>
      {title && <CalendarTitle>{title}</CalendarTitle>}
      <DatePicker
        shouldCloseOnSelect={false}
        dateFormat='yyyy/MM/dd'
        calendarContainer={CalendarContainer}
        ref={calendarRef}
        renderDayContents={renderDayContents}
        disabledKeyboardNavigation
        {...props}
      />
    </DayPickerWrapper>
  );
};
