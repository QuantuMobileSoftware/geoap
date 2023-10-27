import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { List } from '../../List';
import { Search } from 'components/_shared/Search';
import { Button } from 'components/_shared/Button';

import { areasEvents } from '_events';
import { MODAL_TYPE } from '_constants';
import { getSelectedEntitiesId, selectUser } from 'state';
import { isStringsMatch } from 'utils';

import {
  AreasSidebarMessage,
  AreasSidebarButton,
  StyledIcon,
  ButtonWrapper
} from './AreasList.styles';

export const AreasList = React.memo(({ areas }) => {
  const selectedAreas = useSelector(getSelectedEntitiesId);
  const user = useSelector(selectUser);
  const [listItems, setListItems] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUpSortList, setIsUpSortList] = useState(true);
  const [searchValue, setSearchValue] = useState(null);

  useEffect(() => {
    return areasEvents.onCreateShape(({ json }) => {
      if (!json) setIsDrawing(true);
    });
  }, []);

  useEffect(() => {
    return areasEvents.onClosePopup(() => {
      setIsDrawing(false);
    });
  }, []);

  useEffect(() => {
    if (searchValue) {
      const filteredAreas = areas.filter(area =>
        isStringsMatch({ mainString: area.name, substring: searchValue })
      );
      setListItems(filteredAreas);
    } else {
      setListItems(areas);
      setSearchValue(null);
    }
  }, [areas, searchValue]);

  const sortedListItems = useMemo(() => {
    if (isUpSortList)
      return listItems.sort((prev, next) => prev.name.localeCompare(next.name));

    return listItems.sort((prev, next) => next.name.localeCompare(prev.name));
  }, [isUpSortList, listItems]);

  const handleSearchSubmit = values => {
    setSearchValue(values.query);
  };

  const handleSearchChange = e => {
    setSearchValue(e.target.value);
  };

  const handleSearchReset = () => {
    setListItems(areas);
    setSearchValue(null);
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
        {!!selectedAreas.length && <Button onClick={handleDelete} icon='Delete' />}
      </ButtonWrapper>

      <List areas={sortedListItems} />

      {searchValue && sortedListItems.length === 0 && (
        <AreasSidebarMessage>Areas not found</AreasSidebarMessage>
      )}

      {!user.isDemo &&
        (isDrawing ? (
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
        ))}
    </>
  );
});
