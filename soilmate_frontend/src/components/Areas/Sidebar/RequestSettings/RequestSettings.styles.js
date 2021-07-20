import styled, { css } from 'styled-components';
import { em, rem } from 'styles';
import DatePicker from 'react-datepicker';
import { Button } from 'components/_shared/Button';

export const ButtonWrapper = styled.div`
  ${({ theme }) => css`
    margin-top: ${em(33)};
    text-align: right;
    button:first-child {
      margin-right: ${em(11)};
      border: ${theme.borders.default(theme.fontSizes[2])};
    }
  `}
`;

export const StyledDatePicker = styled(DatePicker)`
  ${({ theme }) => css`
    width: 100%;
    border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
    color: ${theme.colors.nature.n3};
    padding: ${rem(9)} ${rem(10)} ${rem(7)};
    border-radius: ${em(theme.radius[0], theme.fontSizes[2])};
    cursor: pointer;
    outline: none;
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
`;
