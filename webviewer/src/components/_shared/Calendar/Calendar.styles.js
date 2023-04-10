import styled, { css } from 'styled-components';
import { SelectToggleGeneral, em, rem } from 'styles';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Typography } from '../Typography';

const disabledColor = '#ccc';

export const StyledDatePicker = styled.button`
  ${({ theme }) => css`
    width: 100%;
    border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
    color: ${theme.colors.nature.n3};
    padding: ${rem(9)} ${rem(10)} ${rem(7)};
    border-radius: ${em(theme.radius[0], theme.fontSizes[2])};
    background: ${theme.colors.nature.n0};
    text-align: left;
    cursor: pointer;
    outline: none;
    font-size: ${rem(16)};
    &:hover,
    &:focus {
      border-color: ${theme.colors.primary.p2};
      color: ${theme.colors.primary.p2};
    }
  `}
`;

export const ApplyButton = styled(Button)`
  display: block;
  width: ${em(220)};
  margin: auto;
  margin-top: ${em(30)};
  clear: both;
`;

export const StyledIcon = styled(Icon)`
  position: absolute;
  top: 50%;
  right: ${rem(13)};
  transform: translateY(-50%);
  transform: rotate(${props => (props.open ? 180 : 0)}deg);
`;

export const StyledCalendarContainer = styled.div`
  ${({ theme }) => {
    const activeCalendarDay = `
      position: relative;
      background: ${theme.colors.primary.p2};
      border-radius: 50%;
      z-index: ${theme.zIndexes[0]};
    `;

    return css`
      position: relative;
      background: ${theme.colors.nature.n0};
      padding-bottom: 10px;
      & .react-datepicker__day--today {
        font-weight: normal;
        &:hover {
          background: ${theme.colors.nature.n1};
        }
      }
      & .react-datepicker__day--keyboard-selected {
        background: ${theme.colors.primary.p1};
        color: ${theme.colors.nature.n0};
        &.react-datepicker__day--disabled {
          color: ${disabledColor};
        }
      }
      & .react-datepicker__day {
        margin-right: 0;
        margin-left: 0;
        width: calc(100% / 7);
        line-height: ${em(17)};
      }
      & .react-datepicker__day--selected {
        color: ${theme.colors.nature.n0};
        font-weight: normal;
        background: inherit;
        ${CalendarDay} {
          ${activeCalendarDay}
        }
      }

      // HEADER
      & .react-datepicker__header {
        background: ${theme.colors.nature.n0};
        border: none;
      }
      & .react-datepicker__navigation {
        top: ${rem(5)};
      }
      & .react-datepicker__current-month {
        font-weight: ${theme.fontWeights[1]};
        font-size: ${rem(16)};
        color: ${theme.colors.nature.n5};
      }
      & .react-datepicker__day-names {
        margin-top: ${em(6)};
        padding: 0 ${rem(6)};
        background: ${theme.colors.nature.n1};
      }
      & .react-datepicker__day-name {
        width: calc(100% / 7);
        font-size: ${em(10)};
        margin: 0;
      }
    `;
  }}
`;

export const CalendarDay = styled.div`
  display: flex;
  margin: auto;
  font-size: ${rem(12)};
  height: ${rem(28)};
  width: ${rem(28)};
  & > span {
    display: block;
    margin: auto;
    padding-top: ${rem(1)};
  }
`;

export const CalendarTitle = styled(Typography).attrs({ variant: 'caption1' })`
  ${({ theme }) => css`
    color: ${theme.colors.nature.n5};
    font-size: ${rem(14)};
  `}
`;

export const StyledMonthPickerContainer = styled(StyledCalendarContainer)`
  ${({ theme }) => css`
    width: auto;
    padding: ${rem(10)};
    & .react-datepicker__month-container {
      width: 100%;
    }
    & .react-datepicker__month-text {
      border-radius: 20px;
      width: ${rem(40)};
    }
    & .react-datepicker__month-text.react-datepicker__month--selected:hover,
    & .react-datepicker__month-wrapper div.react-datepicker__month--selected,
    & .react-datepicker__month-text--keyboard-selected {
      background: ${theme.colors.primary.p2};
      color: ${theme.colors.nature.n0};
    }
    & .react-datepicker__month-text--keyboard-selected.react-datepicker__month--disabled {
      color: ${disabledColor};
      background: inherit;
    }
    & .react-datepicker__navigation {
      top: ${rem(12)};
    }
  `}
`;

export const DatePickerWrapper = styled.div`
  & .react-datepicker-popper[data-placement^='bottom'] {
    padding: 0;
  }
  & .react-datepicker__input-container {
    min-width: 230px;
  }
`;

// Day Picker
export const DayPickerWrapper = styled.div`
  ${({ theme }) => css`
    // input
    & .react-datepicker__input-container input {
      ${SelectToggleGeneral}
      width: 100%;
      color: ${theme.colors.nature.n3};
      outline: none;
    }

    & .react-datepicker-popper {
      padding: 0;
    }
  `}
`;
