import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from 'components/_shared/Checkbox';
import { Preloader } from 'components/_shared/Preloader';
import { SIDEBAR_MODE, NO_DATA } from '_constants';
import { useAreasActions, getSelectedResults } from 'state';

import {
  ReportListItemBody,
  ReportListItemText,
  ResultListItem,
  ReportListItemDate
} from './ReportListItem.styles';

export const ReportListResult = ({ report = {}, reportDate }) => {
  const selectedResults = useSelector(getSelectedResults);
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

  return (
    <ResultListItem isActive={isActive} onClick={handleRequestClick}>
      {isResult && <Checkbox checked={isChecked} />}
      <ReportListItemBody>
        <ReportListItemText $hasData={hasData}>{reportName}</ReportListItemText>
        <ReportListItemDate>{reportDate}</ReportListItemDate>
      </ReportListItemBody>
      {!isResult && <Preloader />}
    </ResultListItem>
  );
};
