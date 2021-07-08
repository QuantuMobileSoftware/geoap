import React, { useRef } from 'react';

import { RequestsList } from './RequestsList.styles';

import { ListItem } from './Item';

export const List = ({ requests = [], ...props }) => {
  const requestsRef = useRef(null);

  const requestsList = requests.map(request => (
    <ListItem key={request.id} request={request} parent={requestsRef} />
  ));

  return (
    <RequestsList ref={requestsRef} {...props} isEmpty={!requests.length}>
      {requestsList}
    </RequestsList>
  );
};
