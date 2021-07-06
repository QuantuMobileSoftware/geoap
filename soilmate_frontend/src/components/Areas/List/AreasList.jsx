import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentArea } from 'state';

import { AreasList } from './AreasList.styles';

import { ListItem } from './Item';

export const List = ({ areas = [], ...props }) => {
  const currentAreaId = useSelector(selectCurrentArea);
  const areasRef = useRef(null);

  const areasList = areas.map(area => (
    <ListItem
      key={area.id}
      isActive={currentAreaId === area.id}
      area={area}
      parent={areasRef}
    />
  ));

  return (
    <AreasList ref={areasRef} {...props} isEmpty={!areas.length}>
      {areasList}
    </AreasList>
  );
};
