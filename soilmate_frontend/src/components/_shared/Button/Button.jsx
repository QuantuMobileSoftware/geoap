import React from 'react';

import { ButtonIcon, ButtonBody, StyledButton } from './Button.styles';

export const Button = ({ children, type = 'button', icon, ...props }) => {
  const hasChildren = !!children;

  return (
    <StyledButton {...props} hasChildren={hasChildren} type={type} icon={icon}>
      {icon && <ButtonIcon>{icon}</ButtonIcon>}
      {children && <ButtonBody>{children}</ButtonBody>}
    </StyledButton>
  );
};
