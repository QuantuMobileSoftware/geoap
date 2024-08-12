import { Option, Select } from 'components/_shared/Select';
import { Typography } from 'components/_shared/Typography';
import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

export const Label = styled(Typography).attrs({ variant: 'caption1' })`
  ${({ theme }) => css`
    display: block;
    color: ${theme.colors.nature.n5};
    font-size: ${rem(14)};
  `}
`;

export const StyledSelect = styled(Select)`
  margin-bottom: ${em(20)};
  ${Option} {
    max-width: 280px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

export const LabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${rem(8)};
  margin-bottom: ${em(20)};
`;
