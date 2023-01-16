import React, { forwardRef } from 'react';

import { StyledPaper } from './Paper.styles';

export const Paper = forwardRef(({ padding = 2, ...props }, ref) => {
  return <StyledPaper {...props} ref={ref} padding={padding} />;
});
