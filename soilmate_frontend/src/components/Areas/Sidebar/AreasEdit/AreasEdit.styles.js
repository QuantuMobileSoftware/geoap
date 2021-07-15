import styled, { css } from 'styled-components';
import { em, rem } from 'styles';
import { Typography } from 'components/_shared/Typography';

export const ButtonWrapper = styled.div`
  ${({ theme }) => css`
    margin-top: ${em(33)};
    text-align: right;
    button:first-child {
      margin-right: ${em(11)};
      border: ${theme.borders.default(theme.fontSizes[2])};
    }
  `}
`;

export const Upload = styled.div`
  margin-top: ${em(32)};
  margin-bottom: ${em(12)};
`;

export const UploadTitle = styled(Typography).attrs({ element: 'p' })`
  ${({ theme }) => css`
    font-size: ${rem(theme.fontSizes[1])};
  `}
`;
