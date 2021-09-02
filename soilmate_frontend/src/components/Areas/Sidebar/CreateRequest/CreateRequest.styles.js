import styled, { css } from 'styled-components';
import { em, sidebarListStyle } from 'styles';

import { Select } from 'components/_shared/Select';

export const ButtonWrapper = styled.div`
  ${({ theme }) => css`
    margin-top: ${em(24)};
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
  ${sidebarListStyle}
`;
