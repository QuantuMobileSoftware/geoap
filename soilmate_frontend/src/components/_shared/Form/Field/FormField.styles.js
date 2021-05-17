import { cloneElement, memo } from 'react';
import styled, { css } from 'styled-components';
import cn from 'classnames';

import { em, rem } from 'styles';

import { Typography, typographyStyle } from 'components/_shared/Typography';

export const FormFieldMessage = styled(Typography).attrs({ element: 'p' })`
  ${({ theme }) => {
    const fontSize = theme.fontSizes[1];

    return css`
      font-size: ${rem(fontSize)};

      &:not(:first-child) {
        margin-top: ${em(theme.spacing[0], fontSize)};
      }
    `;
  }}
`;

export const FormFieldMessageError = styled(FormFieldMessage)`
  ${({ theme }) => css`
    color: ${theme.colors.danger};
  `}
`;

export const FormFieldMessages = styled.div`
  ${({ theme }) => css`
    padding-left: ${rem(theme.spacing[4])};
    margin-top: ${rem(theme.spacing[1])};
  `}
`;

export const FormFieldControl = styled(
  memo(({ children, ...props }) => {
    const className = cn(children.props.className, props.className);
    return cloneElement(children, { ...props, className });
  })
)``;

export const FormFieldLabel = styled.label`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    display: block;
    margin-bottom: ${em(theme.spacing[3], theme.fontSizes[2])};
  `}
`;

export const StyledFormField = styled.div``;
