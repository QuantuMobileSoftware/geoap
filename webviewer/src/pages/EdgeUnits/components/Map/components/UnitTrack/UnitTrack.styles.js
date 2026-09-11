import { createGlobalStyle, keyframes, css } from 'styled-components';

// Real global classes - divIcon markup renders outside React's tree.
const halo = keyframes`
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
`;

export const TrackMarkerGlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    .eu-track-start {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: ${theme.colors.nature.n0};
      border: 2px solid ${theme.colors.nature.n5};
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
    }

    .eu-track-pin {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .eu-track-pin-dot {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid ${theme.colors.nature.n0};
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
    }

    .eu-track-pin--satellite .eu-track-pin-dot {
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.55), 0 1px 4px rgba(0, 0, 0, 0.5);
    }

    .eu-track-pin--live::after {
      content: '';
      position: absolute;
      inset: -5px;
      border-radius: 50%;
      border: 1.5px solid ${theme.colors.status.live};
      animation: ${halo} 2.4s ease-out infinite;
    }

    .eu-track-pin--live.eu-track-pin--satellite::after {
      border-color: #8fd3a0;
    }

    @media (prefers-reduced-motion: reduce) {
      .eu-track-pin--live::after {
        animation: none;
        display: none;
      }
    }
  `}
`;
