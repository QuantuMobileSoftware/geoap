import styled from 'styled-components';
import { em, rem } from 'styles';
import { css } from 'styled-components';

import { Select } from 'components/_shared/Select';

export const StyledSelect = styled(Select)`
  width: ${em(300)};
`;
export const ModalText = styled.p`
  ${({ theme }) => css`
    font-size: ${rem(13)};
    color: ${theme.colors.nature.n4};
  `}
`;
