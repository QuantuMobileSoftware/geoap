import styled, { css } from 'styled-components';
import { Form } from 'components/_shared/Form';

export const StyledMessage = styled.span`
  ${({ theme }) => css`
    color: ${theme.colors.black};
    opacity: 0.7;
  `}
`;

export const StyledForm = styled(Form)`
  max-width: ${({ theme }) => theme.formSize.width};
`;
export const TermsOfService = styled.p`
  ${({ theme }) => css`
    color: ${theme.colors.black};
    opacity: 0.7;
    margin-bottom: 0.5em;
    a {
      color: #043afa;
    }
  `}
`;
