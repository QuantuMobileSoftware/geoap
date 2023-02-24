import styled, { css } from 'styled-components';

import { Link } from 'react-router-dom';
import { Form } from 'components/_shared/Form';
export const StyledLink = styled(Link)`
  ${({ theme }) => css`
    color: ${theme.colors.primary.p2};
    font-weight: ${theme.fontWeights[1]};
    text-decoration: none;
  `}
`;

export const StyledMessage = styled.span`
  ${({ theme }) => css`
    color: ${theme.colors.black};
    opacity: 0.7;
  `}
`;

export const StyledForm = styled(Form)`
  max-width: ${({ theme }) => theme.formSize.width};
`;
