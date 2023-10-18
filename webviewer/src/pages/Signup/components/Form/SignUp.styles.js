import styled, { css } from 'styled-components';
import { em } from 'styles';

export const StyledMessage = styled.span`
  ${({ theme }) => css`
    color: ${theme.colors.black};
    opacity: 0.7;
  `}
`;

export const FormWrapper = styled.div`
  max-width: ${({ theme }) => theme.formSize.width};
`;

export const FormFooter = styled.div`
  margin-top: ${em(20)};
  font-size: ${em(14)};
  text-align: center;
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

export const CheckboxWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: ${em(14)} 0;
  cursor: pointer;
`;

export const CheckboxLabel = styled.div`
  ${({ theme }) => css`
    color: ${theme.colors.nature.n3};
    ${CheckboxWrapper}:hover & {
      color: ${theme.colors.nature.n4};
    }
  `}
`;
