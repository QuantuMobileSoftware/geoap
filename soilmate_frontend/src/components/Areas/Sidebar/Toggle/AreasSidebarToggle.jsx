import React from 'react';

import { StyledAreasSidebarToggle } from './AreasSidebarToggle.styles';

import { areasEvents } from '_events';

export const AreasSidebarToggle = ({ ...props }) => {
  return (
    <StyledAreasSidebarToggle
      {...props}
      variant='floating'
      icon='List'
      onClick={() => areasEvents.toggleSidebar()}
    />
  );
};
