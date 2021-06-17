import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  AreasSidebarButtonAddArea,
  AreasSidebarMessage,
  StyledAreasSidebar
} from './AreasSidebar.styles';

import { AreasSidebarToggle } from './Toggle';
import { AreasList } from '../List';
import { Search } from 'components/_shared/Search';

import { selectAreasList } from 'state';
import { areasEvents } from '_events';

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  const [isAreasNotFound, setIsAreasNotFound] = useState(false);

  const initialAreas = useSelector(selectAreasList);
  const [areas, setAreas] = useState(initialAreas);
  useEffect(() => setAreas(initialAreas), [initialAreas]);

  useEffect(() => {
    return areasEvents.onToggleSidebar(event => {
      rootRef.current.toggle(event.isOpen);
    });
  }, []);

  const resetAreas = () => {
    setIsAreasNotFound(false);
    setAreas(initialAreas);
  };

  const searchAreasByQuery = query => {
    if (!query) return resetAreas();

    const foundAreas = initialAreas.filter(area => {
      return area.name.match(query, 'gi');
    });

    if (!foundAreas.length) {
      setAreas([]);
      return setIsAreasNotFound(true);
    }

    setIsAreasNotFound(false);
    setAreas(foundAreas);
  };

  const handleSearchSubmit = values => {
    searchAreasByQuery(values.query);
  };

  const handleSearchReset = () => {
    resetAreas();
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
          control={{ placeholder: 'Search by name', autoComplete: 'off' }}
          onReset={handleSearchReset}
          onSubmit={handleSearchSubmit}
        />

        <AreasList areas={areas} />

        {isAreasNotFound && <AreasSidebarMessage>Areas not found</AreasSidebarMessage>}

        <AreasSidebarButtonAddArea variant='primary' icon='Plus'>
          Add new area
        </AreasSidebarButtonAddArea>
      </StyledAreasSidebar>
    </>
  );
};