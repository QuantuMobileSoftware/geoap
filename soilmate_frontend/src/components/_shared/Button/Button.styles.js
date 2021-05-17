import styled, { css } from 'styled-components';

import { em, rem } from 'styles';
import { shouldForwardProp } from 'utils';

export const ButtonBody = styled.span``;

export const ButtonIcon = styled.span`
  ${({ theme }) => css`
    + ${ButtonBody} {
      margin-left: ${em(theme.spacing[2])};
    }
  `}
`;

const buttonVariantStyles = {
  primary: ({ theme }) => css`
    color: ${theme.colors.nature.n0};
    background: ${theme.colors.primary.p2};

    &:not(:disabled) {
      &:hover {
        background: ${theme.colors.primary.p1};
      }

      &:active {
        background: ${theme.colors.primary.p3};
      }
    }
  `,

  secondary: ({ theme }) => css`
    color: ${theme.colors.nature.n5};
    background: ${theme.colors.nature.n0};
    box-shadow: ${theme.shadows[0]};

    &:not(:disabled) {
      &:hover {
        color: ${theme.colors.primary.p1};
      }

      &:active {
        color: ${theme.colors.primary.p3};
      }
    }
  `
};

const buttonDisabledStyle = ({ theme }) => css`
  color: ${theme.colors.nature.n3};
  background: ${theme.colors.nature.n1};

  &:hover {
    cursor: not-allowed;
  }
`;

export const StyledButton = styled.button.withConfig({ shouldForwardProp })`
  ${({ theme, variant, disabled }) => {
    const fontSize = theme.fontSizes[2];

    return [
      css`
        appearance: none;
        font-family: ${theme.fonts.primary};
        font-size: ${rem(fontSize)};
        font-weight: ${theme.fontWeights[1]};
        text-align: center;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: ${em(theme.radius[2], fontSize)};
        padding: ${em([theme.spacing[3], theme.spacing[7]], fontSize)};
        transition: ${theme.transitions.fast};

        &:hover {
          cursor: pointer;
        }
      `,
      variant && buttonVariantStyles[variant],
      disabled && buttonDisabledStyle
    ];
  }};
`;
