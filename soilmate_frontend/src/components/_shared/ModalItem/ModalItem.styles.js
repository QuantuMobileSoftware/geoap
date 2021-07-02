import styled, { css } from 'styled-components';
import { Typography } from '../Typography';
import { em, rem } from 'styles';

export const StyledModalItem = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${em(26)};
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
  min-width: ${rem(300)};
  & button {
    margin-left: ${em(20)};
  }
`;
