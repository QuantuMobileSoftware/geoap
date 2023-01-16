import styled, { css } from 'styled-components';
import { rem, em } from 'styles';
import { Typography } from '../Typography';

export const StyledPopup = styled.div`
  ${({ theme }) => css`
    position: absolute;
    min-width: ${rem(312)};
    left: 50%;
    bottom: ${rem(120)};
    transform: translate(-50%, -50%);
    padding: ${em(20)};
    border-radius: ${rem(theme.radius[1])};
    background: ${theme.colors.nature.n0};
    z-index: ${theme.zIndexes[3]};
    cursor: move;
    & > button {
      box-shadow: ${theme.shadows()[0]};
      border: ${theme.borders.default(theme.fontSizes[2])};
    }
    & > button:last-child {
      margin-left: ${em(32, theme.fontSizes[2])};
    }
    &.dragging {
      cursor: grabbing;
    }
  `}
`;

export const Header = styled(Typography).attrs({
  element: 'h4',
  variant: 'body2'
})`
  margin-bottom: ${em(28)};
`;
