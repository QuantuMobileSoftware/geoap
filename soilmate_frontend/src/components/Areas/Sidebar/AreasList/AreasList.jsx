import React, { useState, useEffect } from 'react';

import { List } from '../../List';
import { Search } from 'components/_shared/Search';

import { areasEvents } from '_events';
import { MODAL_TYPE } from '_constants';
import { AreasSidebarMessage, AreasSidebarButton } from './AreasList.styles';

export const AreasList = React.memo(({ areas }) => {
  const [isAreasNotFound, setIsAreasNotFound] = useState(false);
  const [listItems, setListItems] = useState(areas);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => setListItems(areas), [areas]);

  useEffect(() => {
    return areasEvents.onCreateShape(() => {
      setIsDrawing(true);
    });
  }, []);

  useEffect(() => {
    return areasEvents.onClosePopup(() => {
      setIsDrawing(false);
    });
  }, []);

  const resetAreas = () => {
    setIsAreasNotFound(false);
    setListItems(areas);
  };

  const searchAreasByQuery = query => {
    if (!query) {
      resetAreas();
      return;
    }

    const foundAreas = areas.filter(area => {
      return area.name.match(query, 'gi');
    });

    if (!foundAreas.length) {
      setListItems([]);
      setIsAreasNotFound(true);
      return;
    }

    setIsAreasNotFound(false);
    setListItems(foundAreas);
  };

  const handleSearchSubmit = values => {
    searchAreasByQuery(values.query);
  };

  const handleSearchChange = e => {
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
        onChange={handleSearchChange}
      />

      <List areas={listItems} />

      {isAreasNotFound && <AreasSidebarMessage>Areas not found</AreasSidebarMessage>}

      {isDrawing ? (
        <AreasSidebarButton
          variant='primary'
          onClick={() => {
            areasEvents.stopDrawing();
            setIsDrawing(false);
          }}
        >
          Undo drawing
        </AreasSidebarButton>
      ) : (
        <AreasSidebarButton
          variant='primary'
          icon='Plus'
          onClick={() => areasEvents.toggleModal(true, { type: MODAL_TYPE.SAVE })}
        >
          Add new area
        </AreasSidebarButton>
      )}
    </>
  );
});
