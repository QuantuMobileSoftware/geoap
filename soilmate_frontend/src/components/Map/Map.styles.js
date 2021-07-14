import styled, { css } from 'styled-components';

import { rem, em } from 'styles';

import { MapContainer } from 'react-leaflet';

import { Button } from 'components/_shared/Button';

export const MapHolder = styled.div`
  ${() => css`
    position: relative;
    width: 100%;
    height: 100%;
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
