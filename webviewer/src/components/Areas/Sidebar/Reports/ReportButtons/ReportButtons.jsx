import React from 'react';
import { useSelector } from 'react-redux';

import { useAreasActions, selectUser } from 'state';
import { SIDEBAR_MODE, AOI_TYPE } from '_constants';
import { Button } from 'components/_shared/Button';

import { ButtonWrapper } from './ReportButtons.styles';

export const ReportButtons = ({ currentArea }) => {
  const { setSidebarMode } = useAreasActions();
  const user = useSelector(selectUser);

  const areaMode =
    currentArea.type === AOI_TYPE.AREA ? SIDEBAR_MODE.AREAS : SIDEBAR_MODE.FIELDS;
  const handleChangeMode = mode => () => setSidebarMode(mode);

  return (
    <ButtonWrapper>
      <Button
        icon='ArrowInCircle'
        variant='secondary'
        padding={50}
        onClick={handleChangeMode(areaMode)}
      >
        Cancel
      </Button>
      {!user.isDemo && (
        <Button
          icon='Plus'
          variant='primary'
          onClick={handleChangeMode(SIDEBAR_MODE.CREATE_REQUEST)}
        >
          Create new Request
        </Button>
      )}
    </ButtonWrapper>
  );
};
