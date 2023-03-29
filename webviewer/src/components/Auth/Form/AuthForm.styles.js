import styled, { css } from 'styled-components';

export const StyledMessage = styled.span`
  ${({ theme }) => css`
    color: ${theme.colors.black};
    opacity: 0.7;
  `}
`;

export const LinkWrap = styled.div`
  text-align: right;
`;
