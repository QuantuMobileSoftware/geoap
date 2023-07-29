import React, { useRef } from 'react';
import DatePicker from 'react-datepicker';
import {
  ApplyButton,
  DayPickerWrapper,
  StyledCalendarContainer,
  CalendarDay,
  AvaliableDayNotificationFullCoverage,
  AvaliableDayNotificationPartlyCoverage,
  CalendarTitle
} from './Calendar.styles';

const renderDayContents = highlightedDates => (day, date) => {
  const fullCoverageDates = highlightedDates.full_coverage || [];
  const partlyCoverageDates = highlightedDates.partly_coverage || [];

  const dateString = date.toISOString().slice(0, 10);

  const isFullCoverage = fullCoverageDates.includes(dateString);
  const isPartlyCoverage = partlyCoverageDates.includes(dateString);

  return (
    <CalendarDay
      className={
        isFullCoverage
          ? 'full-coverage-date'
          : isPartlyCoverage
          ? 'partly-coverage-date'
          : null
      }
    >
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
        <AvaliableDayNotificationFullCoverage>
          - means that a satellite image is avaliable for that day.
        </AvaliableDayNotificationFullCoverage>
        <AvaliableDayNotificationPartlyCoverage>
          - means that a satellite image is partly avaliable for that day.
        </AvaliableDayNotificationPartlyCoverage>
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
