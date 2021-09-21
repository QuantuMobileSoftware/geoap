import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

import { shouldForwardProp } from 'utils';

const inputDisabledStyle = ({ theme }) => css`
  color: ${theme.colors.nature.n3};
  background: ${theme.colors.nature.n1};

  &:hover {
    cursor: not-allowed;
  }
`;

const inputStyle = ({ theme, disabled }) => {
  const fontSize = theme.fontSizes[2];

  return [
    css`
      appearance: none;
      font-family: ${theme.fonts.primary};
      font-size: ${rem(fontSize)};
      font-weight: ${theme.fontWeights[0]};
      color: ${theme.colors.nature.n4};
      text-align: left;
      width: 100%;
      border: ${theme.borders.default({ fontSize })};
      border-radius: ${em(theme.radius[0], fontSize)};
      background: ${theme.colors.misc.background2};
      padding: ${em([theme.spacing[3], theme.spacing[4]], fontSize)};
      transition: ${theme.transitions.fast};
      outline: none;

      &::placeholder {
        color: ${theme.colors.nature.n3};
      }

      &:hover,
      &:focus {
        border-color: ${theme.colors.primary.p2};
      }
    `,
    disabled && inputDisabledStyle
  ];
};

export const StyledInputText = styled.input.withConfig({ shouldForwardProp })`
  ${inputStyle};
`;

export const StyledTextArea = styled.textarea.withConfig({ shouldForwardProp })`
  ${inputStyle};
  height: ${em(85)};
  resize: none;
`;
