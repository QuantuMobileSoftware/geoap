import styled, { css } from 'styled-components';

import { rem } from 'styles';

import { Form, FormFieldControl } from '../Form';
import { Button } from '../Button';

export const SearchButton = styled(Button)`
  position: absolute;
  top: 50%;
  transform: translateY(calc(-49%));
`;

export const SearchButtonReset = styled(SearchButton)`
  ${({ theme }) => css`
    right: ${rem(theme.spacing[4])};
  `}
`;

export const SearchButtonSubmit = styled(SearchButton)`
  ${({ theme }) => css`
    left: ${rem(theme.spacing[4])};
  `}
`;

export const StyledSearch = styled(Form)`
  ${({ theme }) => {
    const controlPadding = rem(theme.spacing[11] + 2);

    return css`
      position: relative;

      ${FormFieldControl} {
        padding-left: ${controlPadding};
        padding-right: ${controlPadding};
      }
    `;
  }}
`;
