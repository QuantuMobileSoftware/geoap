import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

export const Row = styled.div`
  display: flex;
  gap: ${em(1)};
  ${({ theme }) => css`
    background: ${theme.colors.nature.n2};
    border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
    border-radius: ${em(theme.radius[0])};
    overflow: hidden;
  `}
`;

export const Chip = styled.button`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${em(8)};
    padding: ${em(8)} ${em(14)};
    background: ${theme.colors.nature.n0};
    border: none;
    border-top: ${em(2)} solid transparent;
    cursor: pointer;
    text-align: left;

    &:hover {
      background: ${theme.colors.misc.background};
    }

    &[aria-pressed='true'] {
      background: ${theme.colors.misc.background2};
      border-top-color: ${theme.colors.nature.n5};
    }
  `}
`;

export const Swatch = styled.span`
  ${({ theme, $state }) => css`
    width: ${em(8)};
    height: ${em(8)};
    border-radius: ${em(2)};
    flex: none;
    background: ${theme.colors.status[$state]};
  `}
`;

export const Count = styled.span`
  ${({ theme }) => css`
    font-family: ${theme.fonts.mono};
    font-size: ${rem(18)};
    font-weight: ${theme.fontWeights[1]};
    color: ${theme.colors.nature.n5};
  `}
`;

export const Label = styled.span`
  ${({ theme }) => css`
    font-family: ${theme.fonts.mono};
    font-size: ${rem(10)};
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${theme.colors.nature.n3};
  `}
`;
