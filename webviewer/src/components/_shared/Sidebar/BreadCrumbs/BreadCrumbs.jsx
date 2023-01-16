import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectSidebarMode,
  useAreasActions,
  selectCurrentArea,
  selectAreasList
} from 'state';

import { SIDEBAR_MODE, AOI_TYPE, LEGEND_LABEL } from '_constants';
import { StyledBreadCrumbs, StyledTitle, StyledDash } from './BreadCrumbs.styles';

const { AREAS, FIELDS, REQUESTS, CREATE_REQUEST, EDIT, LEGEND } = SIDEBAR_MODE;

const areas = { title: 'Areas', mode: AREAS };
const fields = { title: 'Fields', mode: FIELDS };
const request = { title: 'Reports', mode: REQUESTS };
const requestSettings = { title: 'New report', mode: CREATE_REQUEST };
const editArea = { title: 'Editing', mode: EDIT };
const legend = { title: LEGEND_LABEL, mode: LEGEND };

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
    [CREATE_REQUEST]: [root, request, requestSettings],
    [LEGEND]: [root, request, legend],
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
