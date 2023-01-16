import styled, { css } from 'styled-components';
import { rgba } from 'polished';

import { em, rem } from 'styles';
import { shouldForwardProp } from 'utils';

import { Icon } from '../Icon';

export const ButtonBody = styled.span``;

export const ButtonIcon = styled(Icon)``;

const buttonVariantStyles = ({ variant, fontSize }) => css`
  ${({ theme }) => {
    const variantStyles = {
      primary: css`
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

      secondary: css`
        color: ${theme.colors.nature.n5};
        background: ${theme.colors.nature.n0};
        box-shadow: ${theme.shadows({ fontSize })[0]};

        &:not(:disabled) {
          &:hover {
            color: ${theme.colors.primary.p1};
          }

          &:active {
            color: ${theme.colors.primary.p3};
          }
        }
      `,

      floating: css`
        color: ${theme.colors.nature.n5};
        width: ${em(40, fontSize)};
        height: ${em(40, fontSize)};
        border-radius: 100%;
        background: ${theme.colors.nature.n0};
        box-shadow: ${theme.shadows({ fontSize })[0]};
        padding: 0;

        ${ButtonIcon} {
          width: ${em(16, fontSize)};
        }

        &:not(:disabled) {
          &:hover {
            color: ${theme.colors.primary.p1};
            background: ${rgba(theme.colors.nature.n1, 0.9)};
          }

          &:active {
            color: ${theme.colors.primary.p3};
            background: ${theme.colors.nature.n0};
            transform: scale(0.9);
          }
        }
      `
    };

    return [
      css`
        border-radius: ${em(theme.radius[3], fontSize)};
        padding: ${em([theme.spacing[3], theme.spacing[7]], fontSize)};
      `,
      variantStyles[variant]
    ];
  }}
`;

const buttonDisabledStyle = ({ theme }) => css`
  color: ${theme.colors.nature.n3};
  background: ${theme.colors.nature.n1};

  &:hover {
    cursor: not-allowed;
  }
`;

const buttonVariantTypeStyles = {
  danger: ({ theme }) => css`
    &:hover,
    &:focus {
      color: ${theme.colors.danger};
    }
  `
};

export const StyledButton = styled.button.withConfig({ shouldForwardProp })`
  ${({ theme, hasChildren, variant, variantType, icon, disabled }) => {
    const fontSize = theme.fontSizes[2];

    return [
      css`
        appearance: none;
        font-family: ${theme.fonts.primary};
        font-size: ${rem(fontSize)};
        font-weight: ${theme.fontWeights[1]};
        color: ${theme.colors.nature.n5};
        text-align: center;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        transition: ${theme.transitions.fast};

        &:hover {
          cursor: pointer;
        }

        ${ButtonIcon} {
          + ${ButtonBody} {
            margin-left: ${em(theme.spacing[2], fontSize)};
          }
        }
      `,
      icon && !hasChildren && `padding: ${em(4, fontSize)};`,
      variant && buttonVariantStyles({ variant, fontSize }),
      !variant &&
        css`
          &:hover {
            color: ${theme.colors.primary.p1};
          }
        `,
      variantType && buttonVariantTypeStyles[variantType],
      disabled && buttonDisabledStyle
    ];
  }};
`;
