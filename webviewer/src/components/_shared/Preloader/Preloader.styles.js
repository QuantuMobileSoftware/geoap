import styled, { css } from 'styled-components';

import { shouldForwardProp } from 'utils';

export const StyledPreloader = styled.div.withConfig({ shouldForwardProp })`
  ${({ size }) => css`
    width: ${size + 'px'};
    height: ${size + 'px'};
  `}
`;
