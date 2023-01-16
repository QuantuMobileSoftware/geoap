import React from 'react';

import { StyledTypography } from './Typography.styles';

export const Typography = ({ element = 'span', ...props }) => {
  return <StyledTypography {...props} element={element} />;
};
