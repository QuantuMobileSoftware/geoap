import React, { useRef } from 'react';

import { Checkbox } from 'components/_shared/Checkbox';

import {
  RequestListItemBody,
  RequestListItemText,
  RequestListItem
} from './RequestListItem.styles';

export const ListItem = ({ request = {}, ...props }) => {
  const areaRef = useRef(null);

  return (
    <RequestListItem
      {...props}
      ref={areaRef}
      // onClick={() => {
      //   setCurrentArea(request.id);
      // }}
    >
      <Checkbox />

      <RequestListItemBody>
        <RequestListItemText>{request.notebook_name}</RequestListItemText>
        <RequestListItemText>
          {request.date_from ? `From: ${request.date_from} ` : ''}{' '}
          {request.date_to ? `To: ${request.date_to}` : ''}
        </RequestListItemText>
      </RequestListItemBody>
    </RequestListItem>
  );
};
