import React, { useEffect } from 'react';

import { PageMainContainer, StyledPageMain } from './PageMain.styles';

import { AreasSidebar } from 'components/Areas';

import { useUserActions } from 'state';

export const PageMain = ({ ...props }) => {
  const { getCurrentUser } = useUserActions();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <StyledPageMain {...props}>
      <PageMainContainer>
        <AreasSidebar />
      </PageMainContainer>
    </StyledPageMain>
  );
};
