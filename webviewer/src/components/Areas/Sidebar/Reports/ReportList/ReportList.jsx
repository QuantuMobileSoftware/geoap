import React from 'react';

import { ReportListItem } from './ReportListItem';

import { StyledReportList } from './ReportList.styles';

export const ReportList = ({ requests = [], results = [], currentArea }) => {
  return (
    <StyledReportList>
      {requests.length > 0 && (
        <ReportListItem reports={requests} currentArea={currentArea} />
      )}
      {results.map((resultsFolder, i) => (
        <ReportListItem reports={resultsFolder} currentArea={currentArea} key={i} />
      ))}
    </StyledReportList>
  );
};
