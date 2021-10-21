import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { StyledAreasSidebar } from './AreasSidebar.styles';

import { AreasSidebarToggle } from './Toggle';
import { AreasEdit } from './AreasEdit';
import { AreasList } from './AreasList';
import { Requests } from './Requests';
import { CreateRequest } from './CreateRequest';
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

const { AREAS, EDIT, REQUESTS, CREATE_REQUEST, FIELDS, CROP_MAP } = SIDEBAR_MODE;

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  const areas = useSelector(selectAreasList);
  const sidebarMode = useSelector(selectSidebarMode);
  const currentAreaId = useSelector(selectCurrentArea);
  const { getLayers, deleteSelectedResult } = useAreasActions();

  const currentArea = areas.find(area => area.id === currentAreaId);
  const sidebarHeaders = {
    [AREAS]: '',
    [EDIT]: `Edit my ${currentArea?.type === AOI_TYPE.AREA ? 'area' : 'field'}`,
    [REQUESTS]: sidebarMode === REQUESTS ? currentArea.name : '',
    [CREATE_REQUEST]: 'Create new report',
    [FIELDS]: '',
    [CROP_MAP]: 'Crop map'
  };

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

  const getSidebarContent = () => {
    switch (sidebarMode) {
      case AREAS:
        return <AreasList areas={areasList} />;
      case EDIT:
        return <AreasEdit currentArea={currentArea} />;
      case REQUESTS:
        return <Requests currentArea={currentArea} />;
      case CREATE_REQUEST:
        return <CreateRequest areas={areas} currentArea={currentArea} />;
      case FIELDS:
        return <Fields fields={fields} />;
      case CROP_MAP:
        return <CropResults currentArea={currentArea} />;
      default:
        return null;
    }
  };

  return (
    <>
      <AreasSidebarToggle />
      <StyledAreasSidebar
        {...props}
        ref={rootRef}
        heading={sidebarHeaders[sidebarMode]}
        withUnmountToggle={false}
      >
        {getSidebarContent()}
      </StyledAreasSidebar>
    </>
  );
};
