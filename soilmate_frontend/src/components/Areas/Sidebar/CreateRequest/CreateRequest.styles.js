import styled, { css } from 'styled-components';
import { em, sidebarList, sidebarBtnMargin } from 'styles';

import { Select } from 'components/_shared/Select';
import { Typography } from 'components/_shared/Typography';

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
export const ButtonWrapper = styled.div`
  ${({ theme }) => css`
    margin: ${em(sidebarBtnMargin)} 0;
    text-align: right;
    button:first-child {
      margin-right: ${em(11)};
      border: ${theme.borders.default(theme.fontSizes[2])};
    }
  `}
`;

export const StyledSelect = styled(Select)`
  margin-bottom: ${em(20)};
`;

export const SelectsWrapper = styled.div`
  ${sidebarList}
  flex-grow: 1;
  & .react-datepicker-wrapper {
    width: 100%;
  }
`;

export const WarningText = styled(Typography).attrs({ variant: 'caption1' })`
  ${({ theme }) => css`
    color: ${theme.colors.danger};
  `}
`;
