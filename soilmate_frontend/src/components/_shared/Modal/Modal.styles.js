import styled, { css } from 'styled-components';
import { rem } from 'styles';
import { Button } from '../Button';
import { Typography } from '../Typography';

export const StyledModalWrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.8);
`;

export const StyledModalMain = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: 50%;
    top: 50%;
    min-width: 250px;
    padding: 44px 40px;
    transform: translate(-50%, -50%);
    background: ${theme.colors.nature.n0};
    box-shadow: ${theme.shadows()[0]};
    border-radius: ${rem(theme.radius[2])};
    color: ${theme.colors.nature.n5};
  `}
`;

export const CloseButton = styled(Button)`
  position: absolute;
  top: 23px;
  right: 17px;
`;

export const ModalHeader = styled(Typography).attrs({
  element: 'h2',
  variant: 'h1'
})`
  margin-bottom: 23px;
`;
