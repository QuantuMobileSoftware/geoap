import { isNumber } from 'lodash-es';
import { em } from 'polished';

import { createBreakpoints } from 'styles/utils';

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
    p1: '#35603D',
    p2: '#2D4F34',
    p3: '#1B4022',
    p4: '#EEF9F0'
  },

  danger: '#CB0000',
  black: '#000000',

  misc: {
    background: '#F9F9F9',
    background2: '#FAFBFD',
    background3: '#FAFAFA'
  }
};

const fonts = {
  primary: 'Poppins'
};

const spacing = [2, 4, 6, 8, 10, 12, 14, 16, 20, 22, 24, 32, 40, 48, 64, 96, 128];

const fontSizes = [8, 10, 12, 13, 16, 20];

const fontWeights = [400, 500];

const lineHeight = [1.5];

const radius = [4, 6, 10, 20];

const zIndexes = [100, 500, 1000, 1500];

const formSize = {
  width: '280px'
};

const borders = theme => ({
  default: props => {
    const { fontSize, color = theme.colors.nature.n1 } = props;
    return `${em(1, fontSize)} solid ${color}`;
  }
});

const shadows = ({ fontSize } = {}) => [
  `0px ${em(1, fontSize)} ${em(4, fontSize)} rgba(0, 0, 0, 0.25);`
];

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

const breakpoints = createBreakpoints({
  x: 320,
  xs: 576,
  sx: 768,
  s: 992,
  sm: 1200,
  ms: 1440
});

export const themeDefault = {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeight,
  spacing,
  radius,
  borders: borders({ colors }),
  shadows,
  duration,
  transitions,
  zIndexes,
  formSize,
  breakpoints,
  setFontSize: size => (isNumber(size) ? fontSizes[size] : parseFloat(size))
};
