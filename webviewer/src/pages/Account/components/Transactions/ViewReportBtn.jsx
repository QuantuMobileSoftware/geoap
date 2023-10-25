import React from 'react';
import { useHistory } from 'react-router-dom';

import { Button } from 'components/_shared/Button';
import { useAreasActions } from 'state';
import { ROUTES, SIDEBAR_MODE } from '_constants';

export const ViewReportBtn = ({ area, request, results }) => {
  const history = useHistory();
  const { setCurrentArea, setSelectedResult, setSidebarMode, patchResults } =
    useAreasActions();

  const handleClick = async () => {
    const currentResult = results.find(result => result.request === request);
    history.push(ROUTES.ROOT, { isOpenSidebar: true });
    await patchResults(area);
    setCurrentArea(area.id);
    if (currentResult) setSelectedResult(currentResult.id);
    setSidebarMode(SIDEBAR_MODE.REPORTS);
  };

  return <Button onClick={handleClick}>View report</Button>;
};
