import React from 'react';

import { StyledAreasList } from './AreasList.styles';

import { AreasListItem } from './Item';

export const AreasList = ({ areas = [], ...props }) => {
  const renderAreas = areas.map(area => <AreasListItem key={area.id} area={area} />);

  return (
    <StyledAreasList {...props} isEmpty={!areas.length}>
      {renderAreas}
    </StyledAreasList>
  );
};
