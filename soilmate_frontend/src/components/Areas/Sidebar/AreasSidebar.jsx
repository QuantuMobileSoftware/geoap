import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { StyledAreasSidebar } from './AreasSidebar.styles';

import { AreasSidebarToggle } from './Toggle';
import { AreasEdit } from './AreasEdit';
import { AreasList } from './AreasList';

import { selectAreasList, selectAreaMode } from 'state';
import { areasEvents } from '_events';
import { AREA_MODE } from '_constants';

const sidebarHeaders = {
  [AREA_MODE.LIST]: 'My areas',
  [AREA_MODE.EDIT]: 'Edit my area'
};

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  const initialAreas = useSelector(selectAreasList);
  const areaMode = useSelector(selectAreaMode);

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
        heading={sidebarHeaders[areaMode]}
        withUnmountToggle={false}
      >
        {areaMode === AREA_MODE.LIST && <AreasList initialAreas={initialAreas} />}
        {areaMode === AREA_MODE.EDIT && <AreasEdit areas={initialAreas} />}
      </StyledAreasSidebar>
    </>
  );
};
