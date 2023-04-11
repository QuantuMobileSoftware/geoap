import styled, { css } from 'styled-components';
import { em } from 'styles';
import { Link } from 'components/_shared/Link';
import { Form } from 'components/_shared/Form';

export const StyledMessage = styled.span`
  ${({ theme }) => css`
    color: ${theme.colors.black};
    opacity: 0.7;
  `}
`;

export const ForgotPassLinkWrap = styled.div`
  text-align: right;
`;

export const StyledLink = styled(Link)`
  font-size: ${em(14)};
`;

export const StyledForm = styled(Form)`
  max-width: ${({ theme }) => theme.formSize.width};
`;
