import React from 'react';
import { useSelector } from 'react-redux';

import { useAreasActions, selectUser, getSelectedResults } from 'state';
import { SIDEBAR_MODE, AOI_TYPE } from '_constants';

import { ButtonWrapper, StyledButton } from './ReportButtons.styles';
import { FileLoader } from 'components/FileLoader';

export const ReportButtons = ({ currentArea }) => {
  const { setSidebarMode } = useAreasActions();
  const user = useSelector(selectUser);
  const selectedResults = useSelector(getSelectedResults);

  const areaMode =
    currentArea.type === AOI_TYPE.AREA ? SIDEBAR_MODE.AREAS : SIDEBAR_MODE.FIELDS;
  const handleChangeMode = mode => () => setSidebarMode(mode);

  return (
    <ButtonWrapper>
      {selectedResults.length > 0 && <FileLoader selectedIdResults={selectedResults} />}
      <StyledButton
        border
        icon='ArrowInCircle'
        variant='secondary'
        padding={50}
        onClick={handleChangeMode(areaMode)}
      >
        Cancel
      </StyledButton>
      {!user.isDemo && (
        <StyledButton
          icon='Plus'
          variant='primary'
          onClick={handleChangeMode(SIDEBAR_MODE.CREATE_REQUEST)}
        >
          Create new Request
        </StyledButton>
      )}
    </ButtonWrapper>
  );
};
