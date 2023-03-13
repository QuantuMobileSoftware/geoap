import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAreasActions, selectAreasList } from 'state';
import { AreasSidebar } from 'components/Areas';
import { Map } from 'components/Map';
import { ContactUs } from 'components/ContactUs';
import { PageMainContainer, StyledPageMain } from './PageMain.styles';

export const PageMain = ({ ...props }) => {
  const { getAreas } = useAreasActions();
  const areas = useSelector(selectAreasList);
  const isOpen = props.history.action === 'PUSH' && props.location.state?.isOpenSidebar;

  useEffect(() => {
    if (areas.length) return;
    getAreas();
  }, [getAreas, areas.length]);

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
