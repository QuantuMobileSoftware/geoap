import styled, { css } from 'styled-components';
import { Typography } from '../Typography';

export const StyledModalItem = styled.div`
  ${({ theme }) => css`
    margin-bottom: 26px;
    cursor: pointer;
    &:hover,
    &:hover button {
      color: ${theme.colors.primary.p1};
    }
  `}
`;
export const ModalHeader = styled(Typography).attrs({
  element: 'h4',
  variant: 'body2'
})``;
export const ModalTitle = styled(Typography).attrs({
  element: 'p',
  variant: 'caption2'
})``;
export const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 300px;
  & button {
    margin-left: 20px;
  }
`;
