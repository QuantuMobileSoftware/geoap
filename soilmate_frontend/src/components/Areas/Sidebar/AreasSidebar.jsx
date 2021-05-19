import React, { useEffect, useRef } from 'react';

import { StyledAreasSidebar } from './AreasSidebar.styles';

import { AreasSidebarToggle } from './Toggle';

import { areasEvents } from '_events';

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  useEffect(() => {
    return areasEvents.onToggleSidebar(event => {
      rootRef.current.toggle(event.isOpen);
    });
  }, []);

  return (
    <>
      <AreasSidebarToggle />
      <StyledAreasSidebar
        {...props}
        ref={rootRef}
        heading='My areas'
      ></StyledAreasSidebar>
    </>
  );
};
