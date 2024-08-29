import { Button } from 'components/_shared/Button';
import styled, { css } from 'styled-components';
import { em, sidebarBtnMargin } from 'styles';

export const ButtonWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${em(11)};
  margin-top: ${em(sidebarBtnMargin)};
  text-align: right;
`;

export const StyledButton = styled(Button)`
  ${({ theme, border }) => css`
    flex: 1 1 auto;
    border: ${border && theme.borders.default(theme.fontSizes[2])};
  `}
`;
