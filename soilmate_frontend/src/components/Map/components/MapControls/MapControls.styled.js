import styled, { css } from 'styled-components';

import { rem, em, mapControlsPosition } from 'styles';

import { Button } from 'components/_shared/Button';

export const MapButton = styled(Button)`
  ${({ theme }) =>
    css`
      color: ${theme.colors.nature.n3};
      &:first-child {
        margin-bottom: ${em(10, theme.fontSizes[2])};
      }
    `}
`;

export const MapButtonsHolder = styled.div`
  ${() => css`
    ${mapControlsPosition};
    display: flex;
    flex-direction: column;
    bottom: ${rem(110)};
    z-index: 400;
  `}
`;
