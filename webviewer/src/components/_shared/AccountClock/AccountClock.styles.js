import styled, { css } from 'styled-components';
import { rem } from 'styles';

export const ClockText = styled.span`
  ${({ theme }) => css`
    font-family: ${theme.fonts.mono};
    font-size: ${rem(13)};
    color: ${theme.colors.nature.n4};
  `}
`;
