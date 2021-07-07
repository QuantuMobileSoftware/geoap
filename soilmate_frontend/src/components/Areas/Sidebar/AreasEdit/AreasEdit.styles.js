import styled, { css } from 'styled-components';
import { FormField } from 'components/_shared/Form';
import { em, rem } from 'styles';
import { Typography } from 'components/_shared/Typography';

export const AxisWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const AxisInput = styled(FormField)`
  display: flex;
  align-items: center;
  margin-top: ${em(14)};
  & label {
    margin-bottom: 0;
    margin-right: ${em(10)};
  }
  & input {
    min-width: ${rem(75)};
    max-width: ${rem(75)};
  }
`;

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
