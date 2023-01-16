import React, { useEffect } from 'react';

import { PageMainContainer, StyledPageMain } from './PageMain.styles';

import { AreasSidebar } from 'components/Areas';
import { Map } from 'components/Map';
import { ContactUs } from 'components/ContactUs';

import { useAreasActions, useUserActions } from 'state';

export const PageMain = ({ ...props }) => {
  const { getCurrentUser } = useUserActions();
  const { getAreas } = useAreasActions();

  useEffect(() => {
    getCurrentUser();
    getAreas();
  }, [getCurrentUser, getAreas]);

  return (
    <StyledPageMain {...props}>
      <PageMainContainer>
        <Map />
        <AreasSidebar />
        <ContactUs />
      </PageMainContainer>
    </StyledPageMain>
  );
};
