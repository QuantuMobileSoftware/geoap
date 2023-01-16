import styled, { css } from 'styled-components';

import { shouldForwardProp } from 'utils';

import { Icon } from '../Icon';

export const ImageBackdropIcon = styled(Icon)`
  ${({ theme }) => css`
    color: ${theme.colors.nature.n3};
    width: 75%;
  `}
`;

export const ImageSource = styled.img`
  display: block;
  width: inherit;
  height: inherit;
  border-radius: inherit;
  object-fit: cover;
`;

export const StyledImage = styled.div.withConfig({ shouldForwardProp })`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    height: auto;
    background: ${theme.colors.nature.n1};
  `}
`;
