import { css } from 'styled-components';
import { em } from 'polished';
import { isNumber } from 'lodash-es';

import { createBreakpoints } from 'styles/utils';
import * as animations from 'styles/utils/animations';

const colors = {
  nature: {
    n0: '#FFFFFF',
    n1: '#EFEFEF',
    n2: '#E3E3E3',
    n3: '#898989',
    n4: '#545454',
    n5: '#182B1C'
  },

  primary: {
    p0: '#35603D',
    p1: '#2D4F34',
    p2: '#1B4022'
  },

  danger: '#CB0000',

  misc: {
    background: '#F9F9F9'
  }
};

const fonts = {
  primary: 'Poppins'
};

const fontSizes = {
  x: 8,
  xs: 9,
  sx: 12,
  s: 13,
  sm: 16,
  ms: 20
};

const fontWeights = {
  regular: 400,
  medium: 500
};

const lineHeight = {
  x: 1.5
};

const spacing = {
  x: 4,
  xs: 8,
  sx: 12,
  s: 14,
  sm: 16,
  ms: 20,
  m: 22,
  ml: 24,
  lm: 32,
  l: 40,
  lx: 48,
  xl: 64,
  '2xl': 96,
  '3xl': 128
};

const radius = {
  x: 4,
  xs: 20
};

const borders = theme => ({
  default: props => {
    const { fontSize, color = theme.colors.nature.n1 } = props;
    return `${em(1, fontSize)} solid ${color}`;
  }
});

const duration = {
  fast: '0.2s',
  medium: '0.4s',
  slow: '0.8s'
};

const transitions = {
  fast: `${duration.fast} ease`,
  medium: `${duration.medium} ease`,
  slow: `${duration.slow} ease`
};

const zIndexes = {
  x: 1,
  xs: 5,
  sx: 10,
  s: 15
};

const breakpoints = createBreakpoints({
  x: 320,
  xs: 576,
  sx: 768,
  s: 992,
  sm: 1200,
  ms: 1440
});

const _animations = {
  rotationWithScale: css`
    animation: ${animations.rotationWithScale} 1s linear infinite;
  `
};

export const themeDefault = {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeight,
  spacing,
  radius,
  borders: borders({ colors }),
  duration,
  transitions,
  zIndexes,
  breakpoints,
  animations: _animations,
  setFontSize: size => (isNumber(size) ? size : fontSizes[size])
};
