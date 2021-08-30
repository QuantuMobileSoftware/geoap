import styled, { css } from 'styled-components';

import { rem } from 'styles';

export const StyledHeaderNotifications = styled.div`
  ${({ theme }) => css`
    margin-left: ${rem(theme.spacing[10])};
  `}
`;
