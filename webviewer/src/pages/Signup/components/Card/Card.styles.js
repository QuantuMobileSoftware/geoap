import styled, { css } from 'styled-components';
import { Typography } from 'components/_shared/Typography';
import { em } from 'styles';

export const CardWrap = styled.div`
  min-width: ${({ theme }) => theme.formSize.width};
  text-align: ${props => (props.center ? 'center' : 'left')};
`;
export const Header = styled(Typography).attrs({
  element: 'h2',
  variant: 'h1'
})`
  ${({ theme }) => css`
    color: ${theme.colors.nature.n5};
    margin-bottom: ${em(3)};
  `}
`;

export const CardText = styled(Typography).attrs({
  element: 'p',
  variant: 'body2'
})`
  margin-bottom: ${em(30)};
  color: ${({ error, theme }) => (error ? theme.colors.danger : theme.colors.nature.n4)};
`;
