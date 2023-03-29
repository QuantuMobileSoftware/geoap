import styled, { css } from 'styled-components';
import { rem } from 'styles';
import { rgba } from 'polished';
import { Form } from 'components/_shared/Form';

export const StyledForm = styled(Form)`
  max-width: ${({ theme }) => theme.formSize.width};
`;

export const FormText = styled.p`
  ${({ theme }) => css`
    color: ${rgba(theme.colors.black, 0.7)};
    margin-top: ${rem(-12)};
  `}
`;
