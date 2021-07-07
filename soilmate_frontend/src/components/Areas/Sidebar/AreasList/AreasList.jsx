import React, { useState, useEffect } from 'react';
import { List } from '../../List';
import { Search } from 'components/_shared/Search';
import { areasEvents } from '_events';
import { MODAL_TYPE } from '_constants';
import { AreasSidebarMessage, AreasSidebarButton } from './AreasList.styles';

export const AreasList = React.memo(({ initialAreas }) => {
  const [isAreasNotFound, setIsAreasNotFound] = useState(false);
  const [areas, setAreas] = useState(initialAreas);

  useEffect(() => setAreas(initialAreas), [initialAreas]);

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
    </>
  );
});
