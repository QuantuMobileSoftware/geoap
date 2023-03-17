import React from 'react';
import { useHistory } from 'react-router-dom';

import { useAreasActions } from 'state';
import { ROUTES, SIDEBAR_MODE } from '_constants';
import { areasEvents } from '_events';

import { MenuItem, StyledMenu } from './Menu.styles';

export const Menu = () => {
  const history = useHistory();
  const { setSidebarMode } = useAreasActions();

  const handleOpenFields = () => {
    history.push(ROUTES.ROOT, { isOpenSidebar: true });
    areasEvents.toggleSidebar(true);
    setSidebarMode(SIDEBAR_MODE.FIELDS);
  };

  const handleOpenAreas = () => {
    history.push(ROUTES.ROOT, { isOpenSidebar: true });
    areasEvents.toggleSidebar(true);
    setSidebarMode(SIDEBAR_MODE.AREAS);
  };

  const handleOpenContactUs = () => {
    areasEvents.toggleContactUs(true);
  };

  return (
    <StyledMenu>
      <MenuItem onClick={handleOpenFields}>Fields</MenuItem>
      <MenuItem onClick={handleOpenAreas}>Areas</MenuItem>
      <MenuItem onClick={handleOpenContactUs}>Contact us</MenuItem>
    </StyledMenu>
  );
};
