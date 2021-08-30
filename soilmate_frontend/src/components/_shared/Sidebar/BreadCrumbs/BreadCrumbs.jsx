import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectSidebarMode,
  useAreasActions,
  selectCurrentArea,
  selectAreasList
} from 'state';

import { SIDEBAR_MODE, AOI_TYPE } from '_constants';
import { StyledBreadCrumbs, StyledTitle, StyledDash } from './BreadCrumbs.styles';

const { AREAS, FIELDS, REQUESTS, REQUEST_SETTINGS, EDIT } = SIDEBAR_MODE;

const areas = { title: 'Areas', mode: AREAS };
const fields = { title: 'Fields', mode: FIELDS };
const request = { title: 'Reports', mode: REQUESTS };
const requestSettings = { title: 'Create report', mode: REQUEST_SETTINGS };
const editArea = { title: 'Editing', mode: EDIT };

export const BreadCrumbs = () => {
  const sidebarMode = useSelector(selectSidebarMode);
  const { setSidebarMode } = useAreasActions();
  const currentAreaId = useSelector(selectCurrentArea);
  const allAreas = useSelector(selectAreasList);
  const currentArea = allAreas.find(area => area.id === currentAreaId);

  const root = currentArea?.type === AOI_TYPE.AREA ? areas : fields;
  const breadCrumbsTitles = {
    [AREAS]: [areas],
    [FIELDS]: [fields],
    [REQUESTS]: [root, request],
    [REQUEST_SETTINGS]: [root, request, requestSettings],
    [EDIT]: [root, editArea]
  };

  return (
    <StyledBreadCrumbs>
      {breadCrumbsTitles[sidebarMode]?.map((el, i) => {
        const isLastElement = i + 1 === breadCrumbsTitles[sidebarMode].length;
        return (
          <span key={i}>
            <StyledTitle
              onClick={() => {
                if (!isLastElement) {
                  setSidebarMode(el.mode);
                }
              }}
            >
              {el.title}
            </StyledTitle>
            {!isLastElement ? <StyledDash> - </StyledDash> : null}
          </span>
        );
      })}
    </StyledBreadCrumbs>
  );
};
