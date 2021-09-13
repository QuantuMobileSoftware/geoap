import styled, { css } from 'styled-components';

import { rem, mapControls } from 'styles';

export const ColorBarWrapper = styled.div`
  ${mapControls};
  top: ${rem(30)};
  width: ${rem(140)};
  padding: ${rem(18)} ${rem(10)};
`;

export const ColorBar = styled.div`
  ${({ colors, theme }) => css`
    width: 100%;
    height: ${rem(4)};
    background: linear-gradient(to right, ${colors});
    border-radius: ${rem(theme.radius[1])};
  `}
`;
