import styled, { css } from 'styled-components';

import { rem } from 'styles';

import { Form, FormFieldControl } from '../Form';
import { StyledButton } from '../Button';

export const StyledSearch = styled(Form)`
  ${({ theme }) => css`
    position: relative;

    ${StyledButton} {
      position: absolute;
      left: ${rem(theme.spacing[4])};
      top: 50%;
      transform: translateY(calc(-49%));
    }

    ${FormFieldControl} {
      padding-left: ${rem(theme.spacing[11] + 2)};
    }
  `}
`;
