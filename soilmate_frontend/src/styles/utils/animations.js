import { keyframes } from 'styled-components';

export const rotationWithScale = keyframes`
  0% {
    transform: rotate(0) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);

  }
  100% {
    transform: rotate(360deg) scale(1);
  }
`;
