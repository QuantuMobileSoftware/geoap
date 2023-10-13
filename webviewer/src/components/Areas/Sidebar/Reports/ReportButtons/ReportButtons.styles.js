import styled, { css } from 'styled-components';
import { em, sidebarBtnMargin } from 'styles';

export const ButtonWrapper = styled.div`
  ${({ theme }) => css`
    margin-top: ${em(sidebarBtnMargin)};
    text-align: right;
    button:first-child {
      margin-right: ${em(11)};
      border: ${theme.borders.default(theme.fontSizes[2])};
      margin-bottom: ${em(11)};
    }
  `}
`;
