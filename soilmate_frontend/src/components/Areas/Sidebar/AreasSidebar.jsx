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
import { AreasEdit } from './AreasEdit';

import { selectAreasList, selectAreaMode } from 'state';
import { areasEvents } from '_events';
import { MODAL_TYPE, AREA_MODE } from '_constants';

export const AreasSidebar = ({ ...props }) => {
  const rootRef = useRef(null);

  const [isAreasNotFound, setIsAreasNotFound] = useState(false);
  const [areas, setAreas] = useState(initialAreas);

  const initialAreas = useSelector(selectAreasList);
  const areaMode = useSelector(selectAreaMode);

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
        {areaMode === AREA_MODE.LIST && (
          <>
            <Search
              control={{ placeholder: 'Search by name', autoComplete: 'off' }}
              onReset={handleSearchReset}
              onSubmit={handleSearchSubmit}
            />

            <List areas={areas} />

            {isAreasNotFound && (
              <AreasSidebarMessage>Areas not found</AreasSidebarMessage>
            )}

            <AreasSidebarButton
              variant='primary'
              icon='Plus'
              onClick={() => areasEvents.toggleModal(true, { type: MODAL_TYPE.SAVE })}
            >
              Add new area
            </AreasSidebarButton>
          </>
        )}
        {areaMode === AREA_MODE.EDIT && <AreasEdit areas={initialAreas} />}
      </StyledAreasSidebar>
    </>
  );
};
