import { Button } from 'components/_shared/Button';
import styled, { css } from 'styled-components';
import { rem } from 'styles';

export const Notification = styled.div`
  ${({ theme }) => css`
    position: fixed;
    top: 54px;
    right: 10px;
    width: 320px;
    z-index: ${theme.zIndexes[2] + 1};
    font-size: ${rem(14)};
    text-align: center;
    color: ${theme.colors.danger};
    padding: ${rem(10)};
    background: ${theme.colors.nature.n0};
    opacity: 0.8;
    transition: ${theme.transitions.fast};
    &:hover {
      opacity: 1;
    }
  `}
`;

export const StyledButton = styled(Button)`
  position: absolute;
  top: -5px;
  right: -5px;
  color: ${({ theme }) => theme.colors.danger};
  padding: 5px;
`;
