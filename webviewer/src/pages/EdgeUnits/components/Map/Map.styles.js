import styled, { css } from 'styled-components';
import { MapContainer } from 'react-leaflet';
import { em, rem } from 'styles';

export const MapHolder = styled.div`
  position: relative;
  width: 100%;
  height: ${em(360)};
`;

export const StyledMapContainer = styled(MapContainer)`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    border-radius: ${em(theme.radius[0])};
    overflow: hidden;
  `}
`;

export const Toolbar = styled.div`
  position: absolute;
  top: ${em(10)};
  right: ${em(10)};
  /* Must clear Leaflet's own controls (z-index 1000). */
  z-index: ${({ theme }) => theme.zIndexes[3]};
  display: flex;
  gap: ${em(6)};
`;

export const ToolbarButton = styled.button`
  ${({ theme }) => css`
    padding: ${em(6)} ${em(10)};
    background: rgba(255, 255, 255, 0.92);
    border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
    border-radius: ${em(theme.radius[0])};
    font-family: ${theme.fonts.mono};
    font-size: ${rem(11)};
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;

    &:hover {
      background: ${theme.colors.nature.n0};
    }

    &[aria-pressed='true'] {
      background: ${theme.colors.nature.n5};
      color: ${theme.colors.nature.n0};
      border-color: ${theme.colors.nature.n5};
    }
  `}
`;

export const EmptyBanner = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${em(10)};
    right: ${em(10)};
    bottom: ${em(10)};
    z-index: ${theme.zIndexes[3]};
    padding: ${em(9)} ${em(12)};
    background: rgba(255, 255, 255, 0.96);
    border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
    border-left: ${em(3)} solid ${theme.colors.status.late};
    border-radius: ${em(theme.radius[0])};
    font-size: ${rem(13)};
    color: ${theme.colors.nature.n5};
  `}
`;
