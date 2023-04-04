import { css } from 'styled-components';
import { rem, em } from 'styles';

export const SelectToggleGeneral = ({ theme }) => css`
  border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
  padding: ${rem(9)} ${rem(10)} ${rem(7)};
  border-radius: ${em(theme.radius[0], theme.fontSizes[2])};
  &:hover {
    border-color: ${theme.colors.primary.p2};
    color: ${theme.colors.primary.p2};
  }
`;
