import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

export const Strip = styled.div`
  display: flex;
  gap: ${em(12)};
`;

export const Card = styled.button`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${em(6)};
    min-width: ${em(160)};
    padding: ${em(10)} ${em(12)};
    background: ${theme.colors.nature.n0};
    border: none;
    border-left: ${em(2)} solid transparent;
    border-radius: ${em(theme.radius[0])};
    box-shadow: ${theme.shadows()[0]};
    text-align: left;
    cursor: pointer;

    &:hover {
      background: ${theme.colors.misc.background};
    }

    &[aria-pressed='true'] {
      background: ${theme.colors.misc.background2};
      border-left-color: ${theme.colors.nature.n5};
    }
  `}
`;

export const UnitId = styled.span`
  ${({ theme }) => css`
    font-family: ${theme.fonts.mono};
    font-size: ${rem(13)};
    font-weight: ${theme.fontWeights[1]};
    color: ${theme.colors.nature.n5};
  `}
`;

export const MachineLabel = styled.span`
  ${({ theme }) => css`
    font-size: ${rem(12)};
    color: ${theme.colors.nature.n4};
  `}
`;

export const LastMessage = styled.span`
  ${({ theme, $state }) => css`
    font-family: ${theme.fonts.mono};
    font-size: ${rem(12)};
    color: ${theme.colors.status[$state]};
  `}
`;

export const StateRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${em(6)};
`;

export const Dot = styled.span`
  ${({ theme, $state }) => css`
    width: ${em(8)};
    height: ${em(8)};
    border-radius: 50%;
    flex: none;
    background: ${theme.colors.status[$state]};
  `}
`;

export const StateLabel = styled.span`
  ${({ theme }) => css`
    font-family: ${theme.fonts.mono};
    font-size: ${rem(10)};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${theme.colors.nature.n4};
  `}
`;

export const MessageCount = styled.span`
  ${({ theme }) => css`
    font-size: ${rem(10)};
    color: ${theme.colors.nature.n3};
  `}
`;

export const Coords = styled.span`
  ${({ theme }) => css`
    font-family: ${theme.fonts.mono};
    font-size: ${rem(10)};
    color: ${theme.colors.nature.n3};
  `}
`;

export const EmptyMessage = styled.p`
  ${({ theme }) => css`
    margin: 0;
    font-size: ${rem(12)};
    color: ${theme.colors.nature.n3};
  `}
`;
