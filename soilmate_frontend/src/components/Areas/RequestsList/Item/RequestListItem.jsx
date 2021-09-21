import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Checkbox } from 'components/_shared/Checkbox';

import { SIDEBAR_MODE, CROP_MAP_LABEL, REQUEST_TABS } from '_constants';
import {
  useAreasActions,
  getSelectedResults,
  selectRequestTab,
  selectCurrentRequests
} from 'state';

import {
  RequestListItemBody,
  RequestListItemText,
  RequestListItem,
  RequestListItemDate
} from './RequestListItem.styles';

export const ListItem = ({ report = {}, ...props }) => {
  const selectedResults = useSelector(getSelectedResults);
  const activeTab = useSelector(selectRequestTab);
  const requests = useSelector(selectCurrentRequests);
  const areaRef = useRef(null);
  const { setSelectedResult, deleteSelectedResult, setSidebarMode } = useAreasActions();
  const [isChecked, setIsChecked] = useState(false);

  const isShowCheckbox = activeTab === REQUEST_TABS.CREATED;

  useEffect(
    () => setIsChecked(selectedResults.some(item => item === report.id)),
    [selectedResults, report.id]
  );

  const handleRequestClick = () => {
    if (isChecked) {
      deleteSelectedResult(report.id);
    } else {
      setSelectedResult(report.id);
      if (report.name === CROP_MAP_LABEL && report.labels) {
        setSidebarMode(SIDEBAR_MODE.CROP_MAP);
      }
    }
    setIsChecked(!isChecked);
  };

  const isActive = selectedResults.some(item => item === report.id);
  const isResult = report.hasOwnProperty('request');
  const { name, filepath, notebook_name } = report;
  const reportName = isResult ? (name ? name : filepath) : notebook_name;
  const reportDate = useMemo(() => {
    const data = isResult ? requests.find(({ id }) => id === report.request) : report;
    if (!data) return '';
    const { date_from, date_to } = data;
    if (date_from && date_to) {
      return `${date_from} / ${date_to}`;
    } else {
      return '';
    }
  }, [isResult, report, requests]);

  return (
    <RequestListItem
      {...props}
      ref={areaRef}
      isActive={isActive}
      onClick={handleRequestClick}
    >
      {isShowCheckbox && <Checkbox checked={isChecked} />}

      <RequestListItemBody>
        <RequestListItemText>{reportName}</RequestListItemText>
        <RequestListItemDate>{reportDate}</RequestListItemDate>
      </RequestListItemBody>
    </RequestListItem>
  );
};
