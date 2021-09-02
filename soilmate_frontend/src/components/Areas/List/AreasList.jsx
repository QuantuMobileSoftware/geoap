import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentArea } from 'state';

import { useAreasActions } from 'state';

import { AreasList } from './AreasList.styles';

import { ListItem } from './Item';

export const List = ({ areas = [], ...props }) => {
  const currentAreaId = useSelector(selectCurrentArea);
  const { deleteSelectedEntityId } = useAreasActions();
  const areasRef = useRef(null);

  useEffect(() => deleteSelectedEntityId(), [deleteSelectedEntityId]);

  const areasList = areas.map(area => (
    <ListItem
      key={area.id}
      isActive={currentAreaId === area.id}
      area={area}
      parent={areasRef}
    />
  ));

  return (
    <AreasList ref={areasRef} {...props} items={areas.length}>
      {areasList}
    </AreasList>
  );
};
