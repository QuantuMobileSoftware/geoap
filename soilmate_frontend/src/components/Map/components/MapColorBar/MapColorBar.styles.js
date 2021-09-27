import styled, { css } from 'styled-components';

import { rem, mapControls } from 'styles';

export const ColorBarWrapper = styled.div`
  ${mapControls};
  top: ${rem(30)};
  width: ${rem(260)};
  padding: ${rem(18)} ${rem(10)};
`;

export const ColorBar = styled.div`
  ${({ colors, theme }) => css`
    margin-top: ${rem(8)};
    margin-bottom: ${rem(4)};
    width: 100%;
    height: ${rem(8)};
    background: linear-gradient(to right, ${colors});
    border-radius: ${rem(theme.radius[1])};
  `}
`;

export const ColorBarTitle = styled.div`
  font-size: ${rem(10)};
`;

export const ColorBarLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${rem(8)};
`;
