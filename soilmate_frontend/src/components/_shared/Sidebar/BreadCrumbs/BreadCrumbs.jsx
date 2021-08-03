import React from 'react';
import { useSelector } from 'react-redux';
import { selectSidebarMode, useAreasActions } from 'state';

import { SIDEBAR_MODE } from '_constants';
import { StyledBreadCrumbs, StyledTitle, StyledDash } from './BreadCrumbs.styles';

const { LIST, REQUESTS, REQUEST_SETTINGS, EDIT } = SIDEBAR_MODE;

const areas = { title: 'Areas', mode: LIST };
const request = { title: 'Reports', mode: REQUESTS };
const requestSettings = { title: 'Create report', mode: REQUEST_SETTINGS };
const editArea = { title: 'Editing', mode: EDIT };

const breadCrumbsTitles = {
  [LIST]: [areas],
  [REQUESTS]: [areas, request],
  [REQUEST_SETTINGS]: [areas, request, requestSettings],
  [EDIT]: [areas, editArea]
};

export const BreadCrumbs = () => {
  const sidebarMode = useSelector(selectSidebarMode);
  const { setSidebarMode } = useAreasActions();

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
