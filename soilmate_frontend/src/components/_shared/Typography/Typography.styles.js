import { createElement } from 'react';
import styled, { css } from 'styled-components';

import { rem } from 'styles';
import { shouldForwardProp } from 'utils';

export const typographyVariantStyles = {
  h1: ({ theme }) => css`
    font-size: ${rem(theme.fontSizes[5])};
    font-weight: ${theme.fontWeights[1]};
  `,

  h2: ({ theme }) => css`
    font-size: ${rem(theme.fontSizes[4])};
    font-weight: ${theme.fontWeights[1]};
  `,

  body1: ({ theme }) => css`
    font-size: ${rem(theme.fontSizes[3])};
    font-weight: ${theme.fontWeights[1]};
  `,

  body2: ({ theme }) => css`
    font-size: ${rem(theme.fontSizes[2])};
    font-weight: ${theme.fontWeights[1]};
  `,

  caption1: ({ theme }) => css`
    font-size: ${rem(theme.fontSizes[2])};
    font-weight: ${theme.fontWeights[0]};
  `,

  caption2: ({ theme }) => css`
    font-size: ${rem(theme.fontSizes[1])};
    font-weight: ${theme.fontWeights[0]};
  `,

  additional: ({ theme }) => css`
    font-size: ${rem(theme.fontSizes[0])};
    font-weight: ${theme.fontWeights[1]};
  `
};

export const typographyStyle = ({ theme, size, variant }) => [
  css`
    font-family: ${theme.fonts.primary};
    font-weight: ${theme.fontWeights[0]};
    line-height: ${theme.lineHeight[0]};
    color: inherit;
  `,
  typographyVariantStyles[variant],
  size && `font-size: ${rem(theme.setFontSize(size))};`
];

export const StyledTypography = styled(({ element, ...props }) => {
  return createElement(element, props);
}).withConfig({ shouldForwardProp })`
  ${typographyStyle};
`;
