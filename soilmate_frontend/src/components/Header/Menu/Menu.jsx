import React from 'react';

import { useAreasActions } from 'state';
import { SIDEBAR_MODE } from '_constants';

import { MenuItem, StyledMenu } from './Menu.styles';

export const Menu = () => {
  const { setSidebarMode } = useAreasActions();
  return (
    <StyledMenu>
      <MenuItem onClick={() => setSidebarMode(SIDEBAR_MODE.FIELDS)}>Fields</MenuItem>
      <MenuItem onClick={() => setSidebarMode(SIDEBAR_MODE.AREAS)}>Areas</MenuItem>
    </StyledMenu>
  );
};
