import styled, { css } from 'styled-components';
import { em } from 'styles';
import { rgba } from 'polished';
import { Typography } from 'components/_shared/Typography';
import { Form } from 'components/_shared/Form';

export const StyledForm = styled(Form)`
  max-width: ${({ theme }) => theme.formSize.width};
`;

export const Header = styled(Typography).attrs({
  element: 'h1',
  variant: 'h1'
})`
  ${({ theme }) => css`
    color: ${theme.colors.nature.n5};
    margin-bottom: ${em(3)};
    text-align: center;
  `}
`;

export const Text = styled(Typography).attrs({
  element: 'p',
  variant: 'body2'
})`
  margin-bottom: ${em(30)};
  color: ${({ theme }) => rgba(theme.colors.black, 0.7)};
  text-align: center;
`;
