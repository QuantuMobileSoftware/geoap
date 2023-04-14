import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAreasActions, selectChartData, selectSidebarMode } from 'state';
import { AreasSidebar } from 'components/Areas';
import { Map } from 'components/Map';
import { Chart } from 'components/Chart';
import { SIDEBAR_MODE } from '_constants';
import { PageMainContainer, StyledPageMain } from './PageMain.styles';

export const PageMain = ({ ...props }) => {
  const { getAreas } = useAreasActions();
  const chart = useSelector(selectChartData);
  const sidebarMode = useSelector(selectSidebarMode);

  const isOpen = props.history.action === 'PUSH' && props.location.state?.isOpenSidebar;
  const isShowChart = sidebarMode === SIDEBAR_MODE.REQUESTS && chart.data;

  useEffect(() => {
    getAreas();
  }, [getAreas]);

  return (
    <StyledPageMain {...props}>
      <PageMainContainer>
        <Map />
        <AreasSidebar isOpen={isOpen} />
        {isShowChart && <Chart chartData={chart} />}
      </PageMainContainer>
    </StyledPageMain>
  );
};
