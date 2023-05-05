import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from 'components/_shared/Checkbox';
import { Preloader } from 'components/_shared/Preloader';
import { SIDEBAR_MODE, NO_DATA } from '_constants';
import { useAreasActions, getSelectedResults } from 'state';

import {
  RequestListItemBody,
  RequestListItemText,
  RequestListItem,
  RequestListItemDate
} from './RequestListItem.styles';

export const ListItem = ({ report = {}, ...props }) => {
  const selectedResults = useSelector(getSelectedResults);
  const areaRef = useRef(null);
  const { setSelectedResult, deleteSelectedResult, setSidebarMode } = useAreasActions();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(
    () => setIsChecked(selectedResults.some(item => item === report.id)),
    [selectedResults, report.id]
  );

  const handleRequestClick = () => {
    if (report.notebook_name) return;
    if (isChecked) {
      deleteSelectedResult(report.id);
    } else {
      setSelectedResult(report.id);
      if (report.labels) setSidebarMode(SIDEBAR_MODE.LEGEND);
    }
    setIsChecked(!isChecked);
  };

  const isActive = selectedResults.some(item => item === report.id);
  const isResult = report.hasOwnProperty('request');
  const { name, layer_type, notebook_name } = report;
  const hasData = !name?.includes(NO_DATA);
  const reportName = isResult ? name || layer_type : notebook_name;

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
      {isResult && <Checkbox checked={isChecked} />}
      <RequestListItemBody>
        <RequestListItemText $hasData={hasData}>{reportName}</RequestListItemText>
        <RequestListItemDate>{reportDate}</RequestListItemDate>
      </RequestListItemBody>
      {!isResult && <Preloader />}
    </RequestListItem>
  );
};
