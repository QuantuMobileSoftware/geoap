import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AreasSidebarToggle } from './Toggle';
import { AreasEdit } from './AreasEdit';
import { AreasList } from './AreasList';
import { Reports } from './Reports';
import { CreateRequest } from './CreateRequest';
import { Fields } from './Fields';
import { CropResults } from './CropResults';

import {
  selectAreasList,
  selectSidebarMode,
  selectCurrentArea,
  useAreasActions,
  getSelectedResults
} from 'state';
import { areasEvents } from '_events';
import { SIDEBAR_MODE, AOI_TYPE } from '_constants';
import { StyledAreasSidebar } from './AreasSidebar.styles';

const { AREAS, EDIT, REPORTS, CREATE_REQUEST, FIELDS, LEGEND } = SIDEBAR_MODE;

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  const areas = useSelector(selectAreasList);
  const sidebarMode = useSelector(selectSidebarMode);
  const currentAreaId = useSelector(selectCurrentArea);
  const selectedResults = useSelector(getSelectedResults);
  const { getLayers, deleteSelectedResult } = useAreasActions();

  const currentArea = areas.find(area => area.id === currentAreaId);

  const legendLabel = useMemo(() => {
    const currentResult = selectedResults[selectedResults.length - 1];
    const label = currentArea?.results?.find(({ id }) => id === currentResult)?.name;
    return label ?? '';
  }, [selectedResults, currentArea]);

  const sidebarHeaders = {
    [AREAS]: '',
    [EDIT]: `Edit my ${currentArea?.type === AOI_TYPE.AREA ? 'area' : 'field'}`,
    [REPORTS]: sidebarMode === REPORTS ? currentArea.name : '',
    [CREATE_REQUEST]: 'Create new report',
    [FIELDS]: '',
    [LEGEND]: legendLabel
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
      case REPORTS:
        return <Reports currentArea={currentArea} />;
      case CREATE_REQUEST:
        return <CreateRequest areas={areas} currentArea={currentArea} />;
      case FIELDS:
        return <Fields fields={fields} />;
      case LEGEND:
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
