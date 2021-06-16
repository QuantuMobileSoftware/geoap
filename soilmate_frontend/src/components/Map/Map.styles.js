import styled, { css } from 'styled-components';

import { Button } from 'components/_shared/Button';

export const MapHolder = styled.div`
  ${() => css`
    position: relative;
    width: 100%;
    height: 100%;
  `}
`;

export const MapButton = styled(Button)`
  ${({ theme, marginBottom }) =>
    css`
      color: ${theme.colors.nature.n3};
      margin-bottom: ${marginBottom ? '10px' : '0px'};
    `}
`;

export const MapButtonsHolder = styled.div`
  ${() => css`
    position: absolute;
    display: flex;
    flex-direction: column;
    right: 20px;
    bottom: 30px;
    z-index: 400;
  `}
`;
