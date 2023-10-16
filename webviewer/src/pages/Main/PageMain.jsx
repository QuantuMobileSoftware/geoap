import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  useAreasActions,
  useInterfaceActions,
  selectChartData,
  selectSidebarMode,
  welcomeWindowState
} from 'state';
import { AreasSidebar } from 'components/Areas';
import { Map } from 'components/Map';
import { Chart } from 'components/Chart';
import { Spinner } from 'components/_shared/Spinner';
import { WelcomeWindow } from 'components/WelcomeWindow';
import { SIDEBAR_MODE, STORAGE_WELCOME_KEY } from '_constants';
import { PageMainContainer, StyledPageMain } from './PageMain.styles';

export const PageMain = ({ ...props }) => {
  const { getAreas, isLoading } = useAreasActions();
  const { hideWelcomeWindow } = useInterfaceActions();
  const chart = useSelector(selectChartData);
  const sidebarMode = useSelector(selectSidebarMode);
  const isShowWelcome = useSelector(welcomeWindowState);

  const isOpen = props.history.action === 'PUSH' && props.location.state?.isOpenSidebar;
  const isShowChart = sidebarMode === SIDEBAR_MODE.REPORTS && chart.data;

  useEffect(() => {
    getAreas();
  }, [getAreas]);

  const handleCloseWelcome = isHide => {
    hideWelcomeWindow(false);
    if (isHide) localStorage.setItem(STORAGE_WELCOME_KEY, isHide);
  };

  if (isLoading) return <Spinner />;

  return (
    <StyledPageMain {...props}>
      <PageMainContainer>
        <Map />
        <AreasSidebar isOpen={isOpen} />
        {isShowChart && <Chart chartData={chart} />}
        {isShowWelcome && <WelcomeWindow onClose={handleCloseWelcome} />}
      </PageMainContainer>
    </StyledPageMain>
  );
};
