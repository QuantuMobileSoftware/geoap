import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { StyledAreasSidebar } from './AreasSidebar.styles';

import { AreasSidebarToggle } from './Toggle';
import { AreasEdit } from './AreasEdit';
import { AreasList } from './AreasList';

import { selectAreasList, setSidebarMode } from 'state';
import { areasEvents } from '_events';
import { SIDEBAR_MODE } from '_constants';

const sidebarHeaders = {
  [SIDEBAR_MODE.LIST]: 'My areas',
  [SIDEBAR_MODE.EDIT]: 'Edit my area'
};

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  const initialAreas = useSelector(selectAreasList);
  const sidebarMode = useSelector(setSidebarMode);

  useEffect(() => {
    return areasEvents.onToggleSidebar(event => {
      rootRef.current.toggle(event.isOpen);
    });
  }, []);

  return (
    <>
      <AreasSidebarToggle />
      <StyledAreasSidebar
        {...props}
        ref={rootRef}
        heading={sidebarHeaders[sidebarMode]}
        withUnmountToggle={false}
      >
        {sidebarMode === SIDEBAR_MODE.LIST && <AreasList initialAreas={initialAreas} />}
        {sidebarMode === SIDEBAR_MODE.EDIT && <AreasEdit areas={initialAreas} />}
      </StyledAreasSidebar>
    </>
  );
};
