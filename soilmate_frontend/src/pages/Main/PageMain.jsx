import React, { useEffect } from 'react';

import { StyledPageMain } from './PageMain.styles';

import { useUserActions } from 'state';

export const PageMain = ({ ...props }) => {
  const { getCurrentUser } = useUserActions();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return <StyledPageMain {...props}>Page: Main</StyledPageMain>;
};
