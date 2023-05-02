import { css } from 'styled-components';
import { em as polishedEm, rem as polishedRem } from 'polished';
import { isArray, isNumber } from 'lodash-es';

const convertSizeMethods = {
  em: polishedEm,
  rem: polishedRem
};

const convertSizes = (method, sizes, base) => {
  const convert = size => {
    if (!isNumber(size)) return size;
    if (size === 0) return 0;

    return convertSizeMethods[method](size, base);
  };

  if (isArray(sizes)) {
    return sizes.reduce((sizes, size) => `${sizes} ${convert(size)}`, '');
  }

  return convert(sizes);
};

export const em = (sizes, base) => convertSizes('em', sizes, base);

export const rem = (sizes, base) => convertSizes('rem', sizes, base);

export const createBreakpoints = breakpoints => {
  const getMediaQuery = size => {
    return (style, widthKey = 'max') => css`
      @media screen and (${widthKey}-width: ${size}px) {
        ${style};
      }
    `;
  };

  return Object.entries(breakpoints).reduce((breakpoints, [key, size]) => {
    return { ...breakpoints, [key]: getMediaQuery(size) };
  }, {});
};
