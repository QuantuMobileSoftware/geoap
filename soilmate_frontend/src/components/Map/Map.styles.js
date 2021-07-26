import styled, { css } from 'styled-components';

import { rem, em } from 'styles';

import { MapContainer } from 'react-leaflet';

import { Button } from 'components/_shared/Button';

const markerIconSize = 14;

export const MapHolder = styled.div`
  ${() => css`
    position: relative;
    width: 100%;
    height: 100%;
    .leaflet-marker-icon.leaflet-interactive {
      width: ${rem(markerIconSize)} !important;
      height: ${rem(markerIconSize)} !important;
      margin-left: ${rem(-(markerIconSize / 2))} !important;
      margin-top: ${rem(-(markerIconSize / 2))} !important;
      border-radius: 50%;
    }
  `}
`;

export const MapButton = styled(Button)`
  ${({ theme }) =>
    css`
      color: ${theme.colors.nature.n3};
      &:first-child {
        margin-bottom: ${em(10, theme.fontSizes[2])};
      }
    `}
`;

export const MapButtonsHolder = styled.div`
  ${() => css`
    position: absolute;
    display: flex;
    flex-direction: column;
    right: ${rem(20)};
    bottom: ${rem(30)};
    z-index: 400;
  `}
`;

export const StyledMapContainer = styled(MapContainer)`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    border-radius: ${rem(theme.radius[1])};
    overflow: hidden;
    .leaflet-bottom.leaflet-right {
      display: none;
    }
  `}
`;
