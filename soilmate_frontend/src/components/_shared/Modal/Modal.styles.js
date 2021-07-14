import styled, { css } from 'styled-components';
import { rem, em } from 'styles';
import { Button } from '../Button';
import { Typography } from '../Typography';
import { rgba } from 'polished';

export const StyledModalWrapper = styled.div`
  ${({ theme }) => css`
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    background: ${rgba(theme.colors.black, 0.8)};
  `}
`;

export const StyledModalMain = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: 50%;
    top: 50%;
    min-width: ${rem(250)};
    padding: ${em(44, theme.fontSizes[5])} ${em(40, theme.fontSizes[5])};
    transform: translate(-50%, -50%);
    background: ${theme.colors.nature.n0};
    box-shadow: ${theme.shadows()[0]};
    border-radius: ${rem(theme.radius[2])};
    color: ${theme.colors.nature.n5};
  `}
`;

export const CloseButton = styled(Button)`
  position: absolute;
  top: ${em(23)};
  right: ${em(17)};
`;

export const ModalHeader = styled(Typography).attrs({
  element: 'h2',
  variant: 'h1'
})`
  ${({ theme }) => css`
    margin-bottom: ${em(23, theme.fontSizes[5])};
  `}
`;
