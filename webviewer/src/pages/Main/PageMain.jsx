import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAreasActions, selectChartData, selectSidebarMode } from 'state';
import { AreasSidebar } from 'components/Areas';
import { Map } from 'components/Map';
import { Chart } from 'components/Chart';
import { SIDEBAR_MODE, STORAGE_WELCOME_KEY } from '_constants';
import { PageMainContainer, StyledPageMain } from './PageMain.styles';
import { Spinner } from 'components/_shared/Spinner';
import { WelcomeWindow } from 'components/WelcomeWindow';

export const PageMain = ({ ...props }) => {
  const { getAreas, isLoading } = useAreasActions();
  const chart = useSelector(selectChartData);
  const sidebarMode = useSelector(selectSidebarMode);
  const [isShowWelcome, setIsShowWelcome] = useState(false);

  const isOpen = props.history.action === 'PUSH' && props.location.state?.isOpenSidebar;
  const isShowChart = sidebarMode === SIDEBAR_MODE.REQUESTS && chart.data;

  useEffect(() => {
    getAreas();
  }, [getAreas]);

  useEffect(() => {
    const value = localStorage.getItem(STORAGE_WELCOME_KEY);
    if (value === null) setIsShowWelcome(true);
  }, []);

  const handleCloseWelcome = isHide => {
    setIsShowWelcome(false);
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
