import React from 'react';
import { Button } from 'components/_shared/Button';
import { useAreasActions } from 'state';
import { useHistory } from 'react-router-dom';
import { ROUTES, SIDEBAR_MODE } from '_constants';

export const ViewReportBtn = ({ request, areas }) => {
  const history = useHistory();
  const { setCurrentArea, setSelectedResult, setSidebarMode } = useAreasActions();

  const handleClick = () => {
    const currentArea = areas.find(({ requests }) =>
      requests.some(({ id }) => id === request)
    );
    const currentResult = currentArea.results.find(result => result.request === request);

    setCurrentArea(currentArea.id);
    if (currentResult) setSelectedResult(currentResult);
    setSidebarMode(SIDEBAR_MODE.REQUESTS);
    history.push(ROUTES.ROOT, { isOpenSidebar: true });
  };

  return <Button onClick={handleClick}>View report</Button>;
};
