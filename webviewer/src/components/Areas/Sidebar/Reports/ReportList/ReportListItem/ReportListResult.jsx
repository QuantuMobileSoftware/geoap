import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from 'components/_shared/Checkbox';
import { Preloader } from 'components/_shared/Preloader';
import { Icon } from 'components/_shared/Icon';
import { SIDEBAR_MODE, NO_DATA } from '_constants';
import { useAreasActions, getSelectedResults } from 'state';

import {
  ReportListItemBody,
  ReportListItemText,
  ResultListItem,
  ReportListItemDate,
  ReportStatus,
  EstimatedTime
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
  const { name, layer_type, notebook_name, validated } = report;
  const hasData = !name?.includes(NO_DATA);
  const reportName = isResult ? name || layer_type : notebook_name;

  const formatRemainingTime = seconds => {
    if (!seconds || seconds <= 0) return null;

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs >= 1 && mins >= 1) return `nearly ${hrs}h ${mins}m`;
    if (hrs >= 1) return `about ${hrs}h`;
    if (mins >= 10) return `about ${mins} minutes`;
    if (mins >= 2) return `less than ${mins + 1} minutes`;
    if (mins === 1) return `about 1 minute`;
    if (secs >= 30) return `less than a minute`;
    return `a few seconds`;
  };

  return (
    <ResultListItem isActive={isActive} onClick={handleRequestClick}>
      {isResult && <Checkbox checked={isChecked} />}
      <ReportListItemBody>
        <ReportListItemText $hasData={hasData}>{reportName}</ReportListItemText>
        <ReportListItemDate>{reportDate}</ReportListItemDate>
        {validated && (
          <ReportStatus>
            <span>Validated</span>
            <Icon>Check</Icon>
          </ReportStatus>
        )}
      </ReportListItemBody>
      {!isResult && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Preloader />
          {report.remaining_time != null && report.remaining_time > 0 && (
            <EstimatedTime>{formatRemainingTime(report.remaining_time)}</EstimatedTime>
          )}
        </div>
      )}
    </ResultListItem>
  );
};
