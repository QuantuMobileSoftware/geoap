import styled, { css } from 'styled-components';
import { rem } from 'styles';

export const StyledLogo = styled.div`
  ${({ theme }) => css`
    color: ${theme.colors.primary.p1};
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${rem(88)};
    height: auto;

    svg {
      color: inherit;
      width: 100%;
      height: 100%;

      path {
        fill: currentColor;
      }
    }
  `}
`;
