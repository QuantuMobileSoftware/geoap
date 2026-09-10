import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: ${em(10)};
  flex-wrap: wrap;
`;

export const Eyebrow = styled.span`
  ${({ theme }) => css`
    font-family: ${theme.fonts.mono};
    font-size: ${rem(10)};
    font-weight: ${theme.fontWeights[1]};
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${theme.colors.nature.n3};
  `}
`;

const groupButton = css`
  ${({ theme }) => css`
    padding: ${em(6)} ${em(11)};
    background: ${theme.colors.nature.n0};
    border: none;
    font-family: ${theme.fonts.mono};
    font-size: ${rem(12)};
    cursor: pointer;

    &:hover:not(:disabled) {
      background: ${theme.colors.misc.background};
    }

    &:disabled {
      color: ${theme.colors.nature.n2};
      cursor: default;
    }
  `}
`;

export const ArrowGroup = styled.div`
  display: flex;
  gap: ${em(1)};
  ${({ theme }) => css`
    background: ${theme.colors.nature.n2};
    border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
    border-radius: ${em(theme.radius[0])};
    overflow: hidden;
  `}

  svg {
    width: ${em(10)};
  }
`;

export const ArrowButton = styled.button`
  ${groupButton}
`;

export const ToggleGroup = styled.div`
  display: flex;
  gap: ${em(1)};
  ${({ theme }) => css`
    background: ${theme.colors.nature.n2};
    border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
    border-radius: ${em(theme.radius[0])};
    overflow: hidden;
  `}
`;

export const ToggleButton = styled.button`
  ${groupButton}
  ${({ theme }) => css`
    &[aria-pressed='true'] {
      background: ${theme.colors.nature.n5};
      color: ${theme.colors.nature.n0};
    }
  `}
`;

export const StyledDateButton = styled.button`
  ${groupButton}
  ${({ theme }) => css`
    border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
    border-radius: ${em(theme.radius[0])};
  `}
`;

export const DayLabel = styled.span`
  ${({ theme }) => css`
    font-family: ${theme.fonts.display};
    font-size: ${rem(16)};
    font-weight: ${theme.fontWeights[1]};
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: ${theme.colors.nature.n5};
  `}
`;
