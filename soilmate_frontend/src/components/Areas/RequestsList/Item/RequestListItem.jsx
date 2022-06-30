import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Checkbox } from 'components/_shared/Checkbox';

import { SIDEBAR_MODE, REQUEST_TABS, NO_DATA } from '_constants';
import { useAreasActions, getSelectedResults, selectRequestTab } from 'state';

import {
  RequestListItemBody,
  RequestListItemText,
  RequestListItem,
  RequestListItemDate
} from './RequestListItem.styles';

export const ListItem = ({ report = {}, ...props }) => {
  const selectedResults = useSelector(getSelectedResults);
  const activeTab = useSelector(selectRequestTab);
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
      if (report.labels) {
        setSidebarMode(SIDEBAR_MODE.LEGEND);
      }
    }
    setIsChecked(!isChecked);
  };

  const isActive = selectedResults.some(item => item === report.id);
  const isResult = report.hasOwnProperty('request');
  const { name, filepath, notebook_name } = report;
  const hasData = !name?.includes(NO_DATA);
  const reportName = isResult ? (name ? name : filepath) : notebook_name;

  const reportDate = useMemo(() => {
    const { date_from, date_to, start_date, end_date } = report;
    if (date_from || date_to || start_date || end_date) {
      return `${date_from ?? start_date ?? '-'} / ${date_to ?? end_date ?? '-'}`;
    } else {
      return '';
    }
  }, [report]);

  return (
    <RequestListItem
      {...props}
      ref={areaRef}
      isActive={isActive}
      onClick={handleRequestClick}
    >
      {isShowCheckbox && <Checkbox checked={isChecked} />}

      <RequestListItemBody>
        <RequestListItemText $hasData={hasData}>{reportName}</RequestListItemText>
        <RequestListItemDate>{reportDate}</RequestListItemDate>
      </RequestListItemBody>
    </RequestListItem>
  );
};
