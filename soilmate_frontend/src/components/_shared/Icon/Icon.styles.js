import styled from 'styled-components';

import { shouldForwardProp } from 'utils';

export const StyledIcon = styled.span.withConfig({ shouldForwardProp })`
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;

  svg {
    color: inherit;
    width: inherit;
    height: inherit;

    path[fill] {
      fill: currentColor;
    }
  }
`;
