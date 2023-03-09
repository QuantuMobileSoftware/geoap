import React, { useEffect } from 'react';

import { PageMainContainer, StyledPageMain } from './PageMain.styles';

import { AreasSidebar } from 'components/Areas';
import { Map } from 'components/Map';
import { ContactUs } from 'components/ContactUs';

import { useAreasActions } from 'state';

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
        <ContactUs />
      </PageMainContainer>
    </StyledPageMain>
  );
};
