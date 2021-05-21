import React, { useEffect, useRef } from 'react';

import { StyledAreasSidebar } from './AreasSidebar.styles';

import { AreasSidebarToggle } from './Toggle';
import { AreasList } from '../List';
import { Search } from 'components/_shared/Search';

import { areasEvents } from '_events';

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  useEffect(() => {
    return areasEvents.onToggleSidebar(event => {
      rootRef.current.toggle(event.isOpen);
    });
  }, []);

  const handleSearchSubmit = values => {
    console.log(values);
  };

  return (
    <>
      <AreasSidebarToggle />
      <StyledAreasSidebar
        {...props}
        ref={rootRef}
        heading='My areas'
        withUnmountToggle={false}
      >
        <Search
          control={{ placeholder: 'Search for location', autoComplete: 'off' }}
          onSubmit={handleSearchSubmit}
        />
        <AreasList />
      </StyledAreasSidebar>
    </>
  );
};
