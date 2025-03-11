import styled, { css } from 'styled-components';
import { rem } from 'styles';

export const Notification = styled.div`
  ${({ theme }) => css`
    font-size: ${rem(12)};
    text-align: center;
    color: ${theme.colors.danger};
    padding: ${rem(5)};
    background: ${theme.colors.nature.n1};
  `}
`;
