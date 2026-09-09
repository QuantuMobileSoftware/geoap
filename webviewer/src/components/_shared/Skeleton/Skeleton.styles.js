import styled, { css, keyframes } from 'styled-components';

const pulse = keyframes`
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`;

export const StyledSkeleton = styled.div`
  ${({ theme, $width, $height }) => css`
    width: ${$width};
    height: ${$height};
    border-radius: ${theme.radius[0]}px;
    background: ${theme.colors.nature.n1};
    animation: ${pulse} 1.4s ease-in-out infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `}
`;
