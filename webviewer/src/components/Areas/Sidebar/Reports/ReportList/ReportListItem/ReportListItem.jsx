import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Icon } from 'components/_shared/Icon';
import { ReportListResult } from './ReportListResult';
import { DEFAULT_FOLDER_NAME } from '_constants';
import { useAreasActions, getSelectedResults } from 'state';

import {
  ReportListItemBody,
  ReportListItemText,
  ReportListFolder,
  ReportListItemDate
} from './ReportListItem.styles';

export const ReportListItem = ({ reports }) => {
  const { deleteSelectedResult } = useAreasActions();
  const selectedResults = useSelector(getSelectedResults);
  const [isOpen, setIsOpen] = useState(false);

  const isShowFolder = reports[0].hasOwnProperty('request');
  const folderName = reports[0].requestName;

  useEffect(() => {
    const isSelected = reports.some(({ id }) => selectedResults.includes(id));
    if (isSelected) setIsOpen(true);
  }, [reports, selectedResults]);

  const reportDate = useMemo(() => {
    const { date_from, date_to, start_date, end_date } = reports[0];
    if (date_from || date_to || start_date || end_date) {
      return `${date_from ?? start_date ?? '-'} / ${date_to ?? end_date ?? '-'}`;
    } else {
      return '';
    }
  }, [reports]);

  const handleFolderClick = () => {
    if (isOpen) {
      reports.forEach(({ id }) => deleteSelectedResult(id));
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isShowFolder && (
        <ReportListFolder isOpen={isOpen} onClick={handleFolderClick}>
          <Icon>{isOpen ? 'CheckFolder' : 'Folder'}</Icon>
          <ReportListItemBody>
            <ReportListItemText $hasData={true}>{folderName}</ReportListItemText>
            {folderName !== DEFAULT_FOLDER_NAME && (
              <ReportListItemDate>{reportDate}</ReportListItemDate>
            )}
          </ReportListItemBody>
        </ReportListFolder>
      )}
      {(isOpen || !isShowFolder) &&
        reports.map(result => (
          <ReportListResult key={result.id} report={result} reportDate={reportDate} />
        ))}
    </>
  );
};
