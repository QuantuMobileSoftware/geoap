import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Checkbox } from 'components/_shared/Checkbox';

import { SIDEBAR_MODE, CROP_MAP_LABEL, REQUEST_TABS } from '_constants';
import { useAreasActions, getSelectedResults, selectRequestTab } from 'state';

import {
  RequestListItemBody,
  RequestListItemText,
  RequestListItem
} from './RequestListItem.styles';

export const ListItem = ({ request = {}, ...props }) => {
  const selectedResults = useSelector(getSelectedResults);
  const activeTab = useSelector(selectRequestTab);
  const areaRef = useRef(null);
  const { setSelectedResult, deleteSelectedResult, setSidebarMode } = useAreasActions();
  const [isChecked, setIsChecked] = useState(false);

  const isShowCheckbox = activeTab === REQUEST_TABS.CREATED;

  useEffect(
    () => setIsChecked(selectedResults.some(item => item === request.id)),
    [selectedResults, request.id]
  );

  const handleRequestClick = () => {
    if (isChecked) {
      deleteSelectedResult(request.id);
    } else {
      setSelectedResult(request.id);
      if (request.name === CROP_MAP_LABEL && request.labels) {
        setSidebarMode(SIDEBAR_MODE.CROP_MAP);
      }
    }
    setIsChecked(!isChecked);
  };

  const isActive = selectedResults.some(item => item === request.id);

  const isResult = request.hasOwnProperty('request');
  const { name, filepath, notebook_name, end_date, date_to } = request;

  return (
    <RequestListItem
      {...props}
      ref={areaRef}
      isActive={isActive}
      onClick={handleRequestClick}
    >
      {isShowCheckbox && <Checkbox checked={isChecked} />}

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
