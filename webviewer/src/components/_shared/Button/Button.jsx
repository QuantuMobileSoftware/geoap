import React, { forwardRef } from 'react';

import { ButtonIcon, ButtonBody, StyledButton, StyledLink } from './Button.styles';

export const Button = forwardRef(
  (
    { children, type = 'button', icon, variantType, fullWidth = false, ...props },
    ref
  ) => {
    const hasChildren = !!children;

    const Tag = props.to ? StyledLink : StyledButton;

    return (
      <Tag
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
      </Tag>
    );
  }
);
