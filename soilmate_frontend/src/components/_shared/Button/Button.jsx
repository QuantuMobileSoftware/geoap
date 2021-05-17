import React from 'react';

import { ButtonIcon, ButtonBody, StyledButton } from './Button.styles';

export const Button = ({
  children,
  type = 'button',
  icon,
  variant = 'primary',
  ...props
}) => {
  return (
    <StyledButton {...props} type={type} variant={variant}>
      {icon && <ButtonIcon>{icon}</ButtonIcon>}
      {children && <ButtonBody>{children}</ButtonBody>}
    </StyledButton>
  );
};
