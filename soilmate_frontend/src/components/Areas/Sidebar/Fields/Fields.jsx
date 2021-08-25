import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { List } from '../../List';
import { Search } from 'components/_shared/Search';
import { Button } from 'components/_shared/Button';
import { FieldsModal } from './FieldsModal';

import { areasEvents } from '_events';
import { MODAL_TYPE } from '_constants';
import { selectSelectedEntitiesId } from 'state';
import {
  SidebarMessage,
  StyledIcon,
  ButtonWrapper,
  CreateFieldButton
} from './Fields.styles';

export const Fields = React.memo(({ fields }) => {
  const selectedAreas = useSelector(selectSelectedEntitiesId);
  const [isAreasNotFound, setIsAreasNotFound] = useState(false);
  const [listItems, setListItems] = useState(fields);
  const [isUpSortList, setIsUpSortList] = useState(true);
  const [isShowModal, setIsShowModal] = useState(false);

  useEffect(() => setListItems(fields), [fields]);

  const resetAreas = () => {
    setIsAreasNotFound(false);
    setListItems(fields);
  };

  const searchAreasByQuery = query => {
    if (!query) {
      resetAreas();
      return;
    }

    const foundAreas = fields.filter(area => {
      return area.name.match(query);
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

  const handleOpenModal = () => setIsShowModal(true);
  const handleCloseModal = () => setIsShowModal(false);

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
          Sorting <StyledIcon $up={isUpSortList}>ArrowUp</StyledIcon>
        </Button>
        {!!selectedAreas.length && <Button onClick={handleDelete} icon='Delete' />}
      </ButtonWrapper>

      <List areas={sortingListItems} />

      {isAreasNotFound && <SidebarMessage>Fields not found</SidebarMessage>}

      <CreateFieldButton variant='primary' icon='Plus' onClick={handleOpenModal}>
        Add new field
      </CreateFieldButton>

      {isShowModal && <FieldsModal closeModal={handleCloseModal} />}
    </>
  );
});
