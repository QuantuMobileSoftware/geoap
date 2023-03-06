import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

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
