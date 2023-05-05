import React, { useRef } from 'react';

import { RequestsList } from './RequestsList.styles';

import { ListItem } from './Item';

export const List = ({ items = [], ...props }) => {
  const requestsRef = useRef(null);

  return (
    <RequestsList ref={requestsRef} {...props} isEmpty={!items.length}>
      {items.map((item, i) => (
        <ListItem key={i} report={item} parent={requestsRef} />
      ))}
    </RequestsList>
  );
};
