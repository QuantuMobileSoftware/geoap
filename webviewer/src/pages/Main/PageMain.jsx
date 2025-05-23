import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  useAreasActions,
  useInterfaceActions,
  selectChartData,
  selectSidebarMode,
  welcomeWindowState,
  getSelectedResults,
  selectCurrentArea,
  selectAreasList,
  chartActions
} from 'state';
import { AreasSidebar } from 'components/Areas';
import { Map } from 'components/Map';
import { Chart } from 'components/Chart';
import { Spinner } from 'components/_shared/Spinner';
import { WelcomeWindow } from 'components/WelcomeWindow';
import { SIDEBAR_MODE, STORAGE_WELCOME_KEY } from '_constants';
import { PageMainContainer, StyledPageMain } from './PageMain.styles';
// import { selectChartData, chartActions } from './chart.slice';

export const PageMain = ({ ...props }) => {
  const { getAreas, isLoading } = useAreasActions();
  const { hideWelcomeWindow } = useInterfaceActions();
  const chart = useSelector(selectChartData);
  const sidebarMode = useSelector(selectSidebarMode);
  const isShowWelcome = useSelector(welcomeWindowState);
  const selectedResults = useSelector(getSelectedResults);
  const currentAreaId = useSelector(selectCurrentArea);
  const areas = useSelector(selectAreasList);

  useEffect(() => {
    getAreas();
  }, [getAreas]);

  const selectedArea = useMemo(
    () => areas.find(area => area.id === currentAreaId),
    [areas, currentAreaId]
  );
  const currentResult = useMemo(() => {
    const currentResultId = selectedResults[selectedResults.length - 1];
    return selectedArea?.results?.find(({ id }) => id === currentResultId);
  }, [selectedArea?.results, selectedResults]);

  const isOpen = props.history.action === 'PUSH' && props.location.state?.isOpenSidebar;
  const isShowChart = sidebarMode === SIDEBAR_MODE.REPORTS && chart.data;

  const handleCloseWelcome = isHide => {
    hideWelcomeWindow(false);
    if (isHide) localStorage.setItem(STORAGE_WELCOME_KEY, isHide);
  };
  const dispatch = useDispatch();
  const handleChartClose = () => dispatch(chartActions.clearChart());

  if (isLoading) return <Spinner />;

  return (
    <StyledPageMain {...props}>
      <PageMainContainer>
        <Map selectedArea={selectedArea} currentResult={currentResult} />
        <AreasSidebar
          isOpen={isOpen}
          currentArea={selectedArea}
          currentResult={currentResult}
        />
        {isShowChart && <Chart chartData={chart} onClose={handleChartClose} />}
        {isShowWelcome && <WelcomeWindow onClose={handleCloseWelcome} />}
      </PageMainContainer>
    </StyledPageMain>
  );
};
