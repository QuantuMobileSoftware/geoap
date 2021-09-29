import React from 'react';

import { useAreasActions } from 'state';
import { SIDEBAR_MODE } from '_constants';
import { areasEvents } from '_events';

import { MenuItem, StyledMenu } from './Menu.styles';

export const Menu = () => {
  const { setSidebarMode } = useAreasActions();

  const handleOpenFields = () => {
    areasEvents.toggleSidebar(true);
    setSidebarMode(SIDEBAR_MODE.FIELDS);
  };

  const handleOpenAreas = () => {
    areasEvents.toggleSidebar(true);
    setSidebarMode(SIDEBAR_MODE.AREAS);
  };
  // Add contact us when we can send message
  // const handleOpenContactUs = () => {
  //   areasEvents.toggleContactUs(true);
  // };

  return (
    <StyledMenu>
      <MenuItem onClick={handleOpenFields}>Fields</MenuItem>
      <MenuItem onClick={handleOpenAreas}>Areas</MenuItem>
      {/* <MenuItem onClick={handleOpenContactUs}>Contact us</MenuItem> */}
    </StyledMenu>
  );
};
