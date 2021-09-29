import styled, { css } from 'styled-components';

import { rem } from 'styles';

import { MapContainer } from 'react-leaflet';

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
