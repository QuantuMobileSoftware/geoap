import styled, { css } from 'styled-components';

import { Button } from 'components/_shared/Button';

export const StyledAreasSidebarToggle = styled(Button)`
  ${({ theme }) => css`
    z-index: ${theme.zIndexes[1]};
  `}
`;
