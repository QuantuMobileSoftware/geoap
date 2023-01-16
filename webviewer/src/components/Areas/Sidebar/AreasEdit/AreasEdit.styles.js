import styled, { css } from 'styled-components';
import { em, rem, sidebarBtnMargin } from 'styles';
import { Typography } from 'components/_shared/Typography';

export const ButtonWrapper = styled.div`
  ${({ theme }) => css`
    margin-top: ${em(sidebarBtnMargin)};
    text-align: right;
    button:first-child {
      margin-right: ${em(11)};
      border: ${theme.borders.default(theme.fontSizes[2])};
    }
  `}
`;

export const Upload = styled.div`
  margin-top: ${em(32)};
  margin-bottom: ${em(12)};
  & > button {
    font-size: ${em(14)};
  }
`;

export const UploadTitle = styled(Typography).attrs({ element: 'p' })`
  font-size: ${rem(11)};
`;

export const ModalButtonWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
`;

export const ModalText = styled.p`
  margin-bottom: ${em(28)};
  font-size: ${em(11)};
  color: ${props => props.theme.colors.nature.n4};
`;
