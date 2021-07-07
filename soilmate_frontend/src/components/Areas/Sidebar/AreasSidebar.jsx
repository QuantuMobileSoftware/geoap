import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { StyledAreasSidebar } from './AreasSidebar.styles';

import { AreasSidebarToggle } from './Toggle';
import { AreasEdit } from './AreasEdit';
import { AreasList } from './AreasList';
import { Requests } from './Requests';

import { selectAreasList, selectSidebarMode } from 'state';
import { areasEvents } from '_events';
import { SIDEBAR_MODE } from '_constants';

const sidebarHeaders = {
  [SIDEBAR_MODE.LIST]: 'My areas',
  [SIDEBAR_MODE.EDIT]: 'Edit my area',
  [SIDEBAR_MODE.REQUESTS]: 'All reports - '
};

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  const areas = useSelector(selectAreasList);
  const sidebarMode = useSelector(selectSidebarMode);

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
        {sidebarMode === SIDEBAR_MODE.LIST && <AreasList areas={areas} />}
        {sidebarMode === SIDEBAR_MODE.EDIT && <AreasEdit areas={areas} />}
        {sidebarMode === SIDEBAR_MODE.REQUESTS && <Requests />}
      </StyledAreasSidebar>
    </>
  );
};
