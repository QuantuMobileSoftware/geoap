import React, { useRef } from 'react';
import DatePicker from 'react-datepicker';
import {
  ApplyButton,
  DayPickerWrapper,
  StyledCalendarContainer,
  CalendarDay,
  AvaliableDayNotification,
  CalendarTitle
} from './Calendar.styles';

const renderDayContents = highlightedDates => (day, date) => {
  const isHighlighted = highlightedDates.includes(date.toISOString().slice(0, 10));

  return (
    <CalendarDay className={isHighlighted ? 'highlighted-date' : null}>
      <span>{day}</span>
    </CalendarDay>
  );
};

export const DayPicker = ({ title, highlightedDates, ...props }) => {
  const calendarRef = useRef(null);

  const CalendarContainer = ({ children }) => {
    return (
      <StyledCalendarContainer>
        <div>{children}</div>
        <ApplyButton variant='primary' onClick={() => calendarRef.current.setOpen(false)}>
          apply
        </ApplyButton>
        <AvaliableDayNotification>
          - means that a satellite image is avaliable for that day.
        </AvaliableDayNotification>
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
        renderDayContents={renderDayContents(highlightedDates)}
        disabledKeyboardNavigation
        {...props}
      />
    </DayPickerWrapper>
  );
};
