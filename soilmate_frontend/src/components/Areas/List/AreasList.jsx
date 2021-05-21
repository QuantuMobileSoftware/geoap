import React from 'react';
import { useSelector } from 'react-redux';

import { StyledAreasList } from './AreasList.styles';

import { AreasListItem } from './Item';

import { selectAreasList } from 'state';

export const AreasList = ({ ...props }) => {
  const areas = useSelector(selectAreasList);

  const renderAreas = areas.map(area => <AreasListItem key={area.id} area={area} />);

  return <StyledAreasList {...props}>{renderAreas}</StyledAreasList>;
};
