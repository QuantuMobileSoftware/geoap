import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { List } from '../../List';
import { Search } from 'components/_shared/Search';
import { Button } from 'components/_shared/Button';

import { areasEvents } from '_events';
import { MODAL_TYPE } from '_constants';
import { selectSelectedEntitiesId } from 'state';
import {
  AreasSidebarMessage,
  AreasSidebarButton,
  StyledIcon,
  ButtonWrapper
} from './AreasList.styles';

export const AreasList = React.memo(({ areas }) => {
  const selectedAreas = useSelector(selectSelectedEntitiesId);
  const [isAreasNotFound, setIsAreasNotFound] = useState(false);
  const [listItems, setListItems] = useState(areas);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUpSortList, setIsUpSortList] = useState(true);

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

  const handleSortChange = useCallback(() => {
    setIsUpSortList(!isUpSortList);
  }, [isUpSortList]);

  const handleDelete = useCallback(() => {
    areasEvents.toggleModal(true, {
      type: MODAL_TYPE.DELETE,
      id: selectedAreas
    });
  }, [selectedAreas]);

  const sortingListItems = useMemo(() => {
    if (isUpSortList) {
      return listItems.sort((prev, next) => prev.name.localeCompare(next.name));
    }
    return listItems.sort((prev, next) => next.name.localeCompare(prev.name));
  }, [isUpSortList, listItems]);

  return (
    <>
      <Search
        control={{ placeholder: 'Search by name', autoComplete: 'off' }}
        onReset={handleSearchReset}
        onSubmit={handleSearchSubmit}
        onChange={handleSearchChange}
      />

      <ButtonWrapper>
        <Button onClick={handleSortChange}>
          Sorting <StyledIcon up={isUpSortList ? 'true' : ''}>ArrowUp</StyledIcon>
        </Button>
        {!!selectedAreas.length && <Button onClick={handleDelete}>Delete</Button>}
      </ButtonWrapper>

      <List areas={sortingListItems} />

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
