import styled, { css } from 'styled-components';
import { em } from 'styles';
import { typographyStyle } from 'components/_shared/Typography';

export const SessionNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${em(12)};
  margin: ${em(16)} 0;
`;

export const SessionNameLabel = styled.label`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(13)};
    font-weight: 600;
    color: ${theme.colors.nature.n5};
    white-space: nowrap;
  `}
`;

export const SessionNameInput = styled.input`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(13)};
    padding: ${em(4)} ${em(10)};
    border-radius: ${em(6)};
    border: 1px solid ${theme.colors.nature.n2};
    background: ${theme.colors.nature.n0};
    color: ${theme.colors.nature.n5};
    max-width: 280px;
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary.p1};
    }
  `}
`;

export const CombinedSize = styled.p`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(13)};
    color: ${theme.colors.nature.n3};
    margin-top: ${em(8)};
  `}
`;
