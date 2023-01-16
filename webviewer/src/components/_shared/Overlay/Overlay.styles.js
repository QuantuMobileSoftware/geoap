import styled, { css } from 'styled-components';
import { rgba } from 'polished';

import { shouldForwardProp } from 'utils';

export const StyledOverlay = styled.div.withConfig({ shouldForwardProp })`
  ${({ theme, isTransparent }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${isTransparent ? 'transparent' : rgba(0, 0, 0, 0.5)};
    z-index: ${theme.zIndexes[1]};
  `}
`;
