import React, { useState, useMemo } from 'react';

import { Icon } from 'components/_shared/Icon';
import { ReportListResult } from './ReportListResult';
import { DEFAULT_FOLDER_NAME } from '_constants';
import { useAreasActions } from 'state';

import {
  ReportListItemBody,
  ReportListItemText,
  ReportListFolder,
  ReportListItemDate
} from './ReportListItem.styles';

export const ReportListItem = ({ reports, currentArea }) => {
  const { deleteSelectedResult } = useAreasActions();
  const [isOpen, setIsOpen] = useState(false);

  const isShowFolder = reports[0].hasOwnProperty('request');
  const request = currentArea.requests.find(r => r.id === reports[0].request);

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
            <ReportListItemText $hasData={true}>
              {request?.notebook_name ?? DEFAULT_FOLDER_NAME}
            </ReportListItemText>
            {request?.notebook_name && (
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
