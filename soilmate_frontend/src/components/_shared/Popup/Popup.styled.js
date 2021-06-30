import styled, { css } from 'styled-components';
import { rem } from 'styles';
import { Typography } from '../Typography';

export const StyledPopup = styled.div`
  ${({ theme, fontSize }) => css`
    position: absolute;
    left: 50%;
    bottom: 118px;
    transform: translateX(-50%);
    padding: 20px;
    border-radius: ${rem(theme.radius[1])};
    background: ${theme.colors.nature.n0};
    z-index: ${theme.zIndexes[3]};
    & > button {
      box-shadow: ${theme.shadows({ fontSize })[0]};
      border: 1px solid ${theme.colors.nature.n1};
    }
    & > button:last-child {
      margin-left: 32px;
    }
  `}
`;

export const Header = styled(Typography).attrs({
  element: 'h4',
  variant: 'body2'
})`
  margin-bottom: 20px;
`;
