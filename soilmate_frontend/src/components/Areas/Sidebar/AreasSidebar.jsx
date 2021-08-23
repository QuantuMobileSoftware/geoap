import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { StyledAreasSidebar } from './AreasSidebar.styles';

import { AreasSidebarToggle } from './Toggle';
import { AreasEdit } from './AreasEdit';
import { AreasList } from './AreasList';
import { Requests } from './Requests';
import { RequestSettings } from './RequestSettings';
import { Fields } from './Fields';
import { CropResults } from './CropResults';

import {
  selectAreasList,
  selectSidebarMode,
  selectCurrentArea,
  useAreasActions
} from 'state';
import { areasEvents } from '_events';
import { SIDEBAR_MODE, AOI_TYPE } from '_constants';

const { AREAS, EDIT, REQUESTS, REQUEST_SETTINGS, FIELDS, CROP_MAP } = SIDEBAR_MODE;

const sidebarHeaders = {
  [AREAS]: 'My areas',
  [EDIT]: 'Edit my area',
  [REQUESTS]: 'All reports - ',
  [REQUEST_SETTINGS]: 'Settings',
  [FIELDS]: 'My fields',
  [CROP_MAP]: 'Crop map'
};

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  const areas = useSelector(selectAreasList);
  const sidebarMode = useSelector(selectSidebarMode);
  const currentAreaId = useSelector(selectCurrentArea);
  const { getLayers, deleteSelectedResult } = useAreasActions();

  const currentArea = areas.find(area => area.id === currentAreaId);
  const sidebarHeader = `${sidebarHeaders[sidebarMode]} ${
    sidebarMode === REQUESTS ? currentArea.name : ''
  }`;

  useEffect(() => {
    if (sidebarMode === FIELDS || sidebarMode === AREAS) {
      deleteSelectedResult();
    }
  }, [sidebarMode, deleteSelectedResult]);

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
        {sidebarMode === AREAS && <AreasList areas={areasList} />}
        {sidebarMode === EDIT && <AreasEdit currentArea={currentArea} />}
        {sidebarMode === REQUESTS && <Requests areaType={currentArea.type} />}
        {sidebarMode === CROP_MAP && <CropResults currentArea={currentArea} />}
        {sidebarMode === REQUEST_SETTINGS && (
          <RequestSettings areas={areas} currentArea={currentArea} />
        )}
        {sidebarMode === FIELDS && <Fields fields={fields} />}
      </StyledAreasSidebar>
    </>
  );
};
