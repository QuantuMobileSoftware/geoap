import styled, { css, keyframes } from 'styled-components';

import { em } from 'styles';
import { shouldForwardProp } from 'utils';

import { Overlay } from '../Overlay';

const preloaderAnimation = keyframes`
  0% {
      transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const PreloaderIcon = styled.span`
  ${({ theme }) => {
    const color = theme.colors.primary.p1;
    const size = 48;
    const linesSize = size - 16;

    return css`
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${em(size)};
      height: ${em(size)};

      &::after {
        content: '';
        display: block;
        width: ${em(linesSize)};
        height: ${em(linesSize)};
        border-radius: 50%;
        border: ${em(4)} solid ${color};
        border-color: ${color} transparent ${color} transparent;
        animation: ${preloaderAnimation} 1.2s linear infinite;
      }
    `;
  }}
`;

export const PreloaderBody = styled.span`
  ${({ theme, isHidden }) => [
    css`
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: ${theme.zIndexes[1] + 1};
      transition: ${theme.transitions.medium};
    `,
    isHidden && 'opacity: 0;'
  ]}
`;

export const PreloaderOverlay = styled(Overlay)``;

export const StyledPreloader = styled.span.withConfig({ shouldForwardProp })`
  ${({ position }) => css`
    position: ${position};
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  `}
`;
