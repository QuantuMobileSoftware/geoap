import React, { useEffect } from 'react';
import { useAreasActions } from 'state';
import { AreasSidebar } from 'components/Areas';
import { Map } from 'components/Map';
import { PageMainContainer, StyledPageMain } from './PageMain.styles';

export const PageMain = ({ ...props }) => {
  const { getAreas } = useAreasActions();
  const isOpen = props.history.action === 'PUSH' && props.location.state?.isOpenSidebar;

  useEffect(() => {
    getAreas();
  }, [getAreas]);

  return (
    <StyledPageMain {...props}>
      <PageMainContainer>
        <Map />
        <AreasSidebar isOpen={isOpen} />
      </PageMainContainer>
    </StyledPageMain>
  );
};
