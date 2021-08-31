import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { Checkbox } from 'components/_shared/Checkbox';
import { useAreasActions, getSelectedResults } from 'state';

import {
  RequestListItemBody,
  RequestListItemText,
  RequestListItem
} from './RequestListItem.styles';

export const ListItem = ({ request = {}, ...props }) => {
  const selectedResults = useSelector(getSelectedResults);
  const isCheckedDefault = selectedResults.some(item => item === request.id);
  const areaRef = useRef(null);
  const { setSelectedResult, deleteSelectedResult } = useAreasActions();
  const [isChecked, setIsChecked] = useState(isCheckedDefault);

  const handleRequestClick = () => {
    if (isChecked) {
      deleteSelectedResult(request.id);
    } else {
      setSelectedResult(request.id);
    }
    setIsChecked(!isChecked);
  };

  const isResult = request.hasOwnProperty('request');
  const { name, filepath, notebook_name, end_date, date_to } = request;

  return (
    <RequestListItem {...props} ref={areaRef} onClick={handleRequestClick}>
      <Checkbox checked={isChecked} />

      <RequestListItemBody>
        <RequestListItemText>
          {isResult ? (name ? name : filepath) : notebook_name}
        </RequestListItemText>
        <RequestListItemText>
          {isResult ? (end_date ? end_date : '') : date_to ? date_to : ''}
        </RequestListItemText>
      </RequestListItemBody>
    </RequestListItem>
  );
};
