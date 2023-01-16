import { css } from 'styled-components';

import { rem, em } from 'styles';

const controlsRight = 20;

export const mapControlsPosition = css`
  position: absolute;
  right: ${rem(controlsRight)};
`;

export const mapControls = ({ theme }) => css`
  ${mapControlsPosition}
  background-color: ${theme.colors.nature.n0};
  z-index: ${props => props.theme.zIndexes[1]};
  border-radius: ${em(theme.radius[1])};
`;
