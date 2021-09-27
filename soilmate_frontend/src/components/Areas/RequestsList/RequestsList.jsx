import React, { useRef } from 'react';

import { RequestsList } from './RequestsList.styles';

import { ListItem } from './Item';

export const List = ({ items = [], ...props }) => {
  const requestsRef = useRef(null);

  const requestsList = items.map(item => (
    <ListItem key={item.id} report={item} parent={requestsRef} />
  ));

  return (
    <RequestsList ref={requestsRef} {...props} isEmpty={!items.length}>
      {requestsList}
    </RequestsList>
  );
};
