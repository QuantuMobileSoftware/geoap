import React, { useState, useRef, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import {
  ApplyButton,
  StyledDatePicker,
  StyledIcon,
  StyledCalendarContainer,
  CalendarDay,
  CalendarTitle,
  WarningText
} from './Calendar.styles';

const oneDay = 86400000;
const minRangeInDays = 55;

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

export const Calendar = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  title,
  notebook
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef(null);

  const handleOnChange = dates => {
    const [startDate, endDate] = dates;
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const isCropType = notebook === 3;
  const filterDate = date => {
    if (!isCropType || !date) return true;
    const now = date.getTime();
    const daysRange = oneDay * minRangeInDays;
    const dateStart = new Date(date.getFullYear(), 4, 1).getTime();
    const dateEnd = new Date(date.getFullYear(), 8, 30).getTime();
    let _dateEnd = dateEnd - daysRange;
    if (startDate && !endDate) {
      _dateEnd = dateEnd;
      const startMinRange = startDate.getTime();
      const endMinRange = startDate.getTime() + daysRange;
      if (startMinRange < now && now < endMinRange) return false;
    }
    return dateStart <= now && now <= _dateEnd;
  };

  const CalendarContainer = ({ children }) => {
    return (
      <StyledCalendarContainer>
        <div>{children}</div>
        {isCropType && (
          <WarningText>
            You can choose only dates from May to September to have actual result. Select
            at least 55 days
          </WarningText>
        )}
        <ApplyButton variant='primary' onClick={() => calendarRef.current.setOpen(false)}>
          apply
        </ApplyButton>
      </StyledCalendarContainer>
    );
  };

  return (
    <>
      {title && <CalendarTitle>{title}</CalendarTitle>}
      <DatePicker
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
        filterDate={filterDate}
        monthsShown={2}
      />
    </>
  );
};
