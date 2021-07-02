import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  AreasSidebarButton,
  AreasSidebarMessage,
  StyledAreasSidebar
} from './AreasSidebar.styles';

import { AreasSidebarToggle } from './Toggle';
import { List } from '../List';
import { Search } from 'components/_shared/Search';

import { selectAreasList } from 'state';
import { areasEvents } from '_events';
import { MODAL_TYPE } from '_constants';

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

  const handleSearchSubmitOnChange = e => {
    searchAreasByQuery(e.target.value);
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
          onChange={handleSearchSubmitOnChange}
        />

        <List areas={areas} />

        {isAreasNotFound && <AreasSidebarMessage>Areas not found</AreasSidebarMessage>}

        <AreasSidebarButton
          variant='primary'
          icon='Plus'
          onClick={() => areasEvents.toggleModal(true, { type: MODAL_TYPE.SAVE })}
        >
          Add new area
        </AreasSidebarButton>
      </StyledAreasSidebar>
    </>
  );
};
