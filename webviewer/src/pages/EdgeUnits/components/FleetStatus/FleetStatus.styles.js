import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: ${em(10)};
`;

export const Dot = styled.span`
  ${({ theme, $state }) => css`
    width: ${em(9)};
    height: ${em(9)};
    border-radius: 50%;
    flex: none;
    background: ${theme.colors.status[$state]};
  `}
`;

export const StatusText = styled.p`
  ${({ theme }) => css`
    margin: 0;
    font-size: ${rem(14.5)};
    color: ${theme.colors.nature.n5};
  `}
`;
