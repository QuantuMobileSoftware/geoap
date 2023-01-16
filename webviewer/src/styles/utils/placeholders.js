import { css } from 'styled-components';

export const headings = style => css`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    ${style};
  }
`;

export const upperFirst = css`
  &::first-letter {
    text-transform: uppercase;
  }
`;

export const hideScrollbar = css`
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none;
  }
`;
