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
  & > button {
    font-size: ${em(14)};
  }
`;

export const UploadTitle = styled(Typography).attrs({ element: 'p' })`
  font-size: ${rem(11)};
`;
