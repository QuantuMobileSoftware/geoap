import styled, { css } from 'styled-components';
import { em } from 'styles';
import { rgba } from 'polished';
import { Form, FormHeader } from 'components/_shared/Form';

export const StyledForm = styled(Form)`
  max-width: ${({ theme }) => theme.formSize.width};
  ${FormHeader} {
    margin-bottom: ${em(5)};
  }
`;

export const FormText = styled.p`
  ${({ theme }) => css`
    color: ${rgba(theme.colors.black, 0.7)};
  `}
`;
