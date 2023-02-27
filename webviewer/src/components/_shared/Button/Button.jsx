import React, { forwardRef } from 'react';

import { ButtonIcon, ButtonBody, StyledButton } from './Button.styles';

export const Button = forwardRef(
  (
    { children, type = 'button', icon, variantType, fullWidth = false, ...props },
    ref
  ) => {
    const hasChildren = !!children;

    return (
      <StyledButton
        {...props}
        ref={ref}
        hasChildren={hasChildren}
        type={type}
        icon={icon}
        variantType={variantType}
        fullWidth={fullWidth}
      >
        {icon && <ButtonIcon>{icon}</ButtonIcon>}
        {children && <ButtonBody>{children}</ButtonBody>}
      </StyledButton>
    );
  }
);
