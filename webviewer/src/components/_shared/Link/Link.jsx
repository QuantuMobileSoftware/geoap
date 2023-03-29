import React from 'react';
import { StyledLink } from './Link.styles';

export const Link = ({ children, ...props }) => {
  return <StyledLink {...props}>{children}</StyledLink>;
};
