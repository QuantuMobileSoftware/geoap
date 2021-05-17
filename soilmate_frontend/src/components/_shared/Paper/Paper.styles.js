import styled, { css } from 'styled-components';

import { rem } from 'styles';
import { shouldForwardProp } from 'utils';

export const StyledPaper = styled.div.withConfig({ shouldForwardProp })`
  ${({ theme, padding }) => {
    const paddingStyle = {
      1: rem(theme.spacing[4]),
      2: rem(theme.spacing[8]),
      3: rem([theme.spacing[10], theme.spacing[8]]),
      4: rem([theme.spacing[11], theme.spacing[8]])
    };

    return [
      css`
        border-radius: ${rem(theme.radius[1])};
        background: ${theme.colors.nature.n0};
        box-shadow: ${theme.shadows()[0]};
      `,
      padding && `padding: ${paddingStyle[padding]};`
    ];
  }}
`;
