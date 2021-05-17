import React from 'react';

import { StyledPaper } from './Paper.styles';

export const Paper = ({ padding = 2, ...props }) => {
  return <StyledPaper {...props} padding={padding} />;
};
