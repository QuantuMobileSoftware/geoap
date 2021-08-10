import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { StyledAreasSidebar } from './AreasSidebar.styles';

import { AreasSidebarToggle } from './Toggle';
import { AreasEdit } from './AreasEdit';
import { AreasList } from './AreasList';
import { Requests } from './Requests';
import { RequestSettings } from './RequestSettings';
import { Fields } from './Fields';

import {
  selectAreasList,
  selectSidebarMode,
  selectCurrentArea,
  useAreasActions
} from 'state';
import { areasEvents } from '_events';
import { SIDEBAR_MODE, AOI_TYPE } from '_constants';

const sidebarHeaders = {
  [SIDEBAR_MODE.LIST]: 'My areas',
  [SIDEBAR_MODE.EDIT]: 'Edit my area',
  [SIDEBAR_MODE.REQUESTS]: 'All reports - ',
  [SIDEBAR_MODE.REQUEST_SETTINGS]: 'Settings',
  [SIDEBAR_MODE.FIELDS]: 'My fields'
};

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  const areas = useSelector(selectAreasList);
  const sidebarMode = useSelector(selectSidebarMode);
  const currentAreaId = useSelector(selectCurrentArea);
  const { getLayers } = useAreasActions();

  const currentArea = areas.find(area => area.id === currentAreaId);
  const sidebarHeader = `${sidebarHeaders[sidebarMode]} ${
    sidebarMode === SIDEBAR_MODE.REQUESTS ? currentArea.name : ''
  }`;

  useEffect(() => {
    return areasEvents.onToggleSidebar(event => {
      rootRef.current.toggle(event.isOpen);
    });
  }, []);

  useEffect(() => {
    getLayers();
  }, [getLayers]);

  const fields = useMemo(
    () => areas.filter(field => field.type === AOI_TYPE.FIELD),
    [areas]
  );
  const areasList = useMemo(
    () => areas.filter(field => field.type === AOI_TYPE.AREA),
    [areas]
  );

  return (
    <>
      <AreasSidebarToggle />
      <StyledAreasSidebar
        {...props}
        ref={rootRef}
        heading={sidebarHeader}
        withUnmountToggle={false}
      >
        {sidebarMode === SIDEBAR_MODE.LIST && <AreasList areas={areasList} />}
        {sidebarMode === SIDEBAR_MODE.EDIT && <AreasEdit currentArea={currentArea} />}
        {sidebarMode === SIDEBAR_MODE.REQUESTS && <Requests />}
        {sidebarMode === SIDEBAR_MODE.REQUEST_SETTINGS && (
          <RequestSettings areas={areas} currentArea={currentArea} />
        )}
        {sidebarMode === SIDEBAR_MODE.FIELDS && <Fields fields={fields} />}
      </StyledAreasSidebar>
    </>
  );
};
