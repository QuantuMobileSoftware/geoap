import { cloneElement } from 'react';
import styled, { css } from 'styled-components';
import cn from 'classnames';

import { em, rem } from 'styles';
import { shouldForwardProp } from 'utils';

import { Preloader } from '../Preloader';
import { Typography } from '../Typography';

export const FormPreloader = styled(Preloader)``;

export const FormMessage = styled(Typography).attrs({ element: 'p' })`
  ${({ theme }) => {
    const fontSize = theme.fontSizes[2];

    return css`
      font-size: ${rem(fontSize)};

      &:not(:first-child) {
        margin-top: ${em(theme.spacing[0], fontSize)};
      }
    `;
  }}
`;

export const FormMessageError = styled(FormMessage)`
  ${({ theme }) => css`
    color: ${theme.colors.danger};
  `}
`;

export const FormMessages = styled.div`
  ${({ theme }) => css`
    margin-top: ${rem(theme.spacing[7])};
  `}
`;

export const FormFooter = styled.footer``;

export const FormAction = styled(({ children, ...props }) => {
  const className = cn(children.props.className, props.className);
  return cloneElement(children, { ...props, className });
})``;

// TODO: Add grid layout with gap for FormAction
export const FormActions = styled.div`
  ${({ theme }) => css`
    margin-top: ${rem(theme.spacing[10])};
  `}
`;

export const FormBody = styled.div``;

export const StyledForm = styled.form.withConfig({ shouldForwardProp })``;
