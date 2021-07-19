import React, { useMemo } from 'react';
import { Select } from 'components/_shared/Select';
import { Button } from 'components/_shared/Button';
import { SIDEBAR_MODE } from '_constants';
import { useAreasActions, selectLayers } from 'state';
import { ButtonWrapper } from './RequestSettings.styles';
import { useSelector } from 'react-redux';

const startYear = 2015;
const layerYears = Array.from({ length: new Date().getFullYear() - startYear + 1 }).map(
  (el, i) => ({ value: startYear + i, name: startYear + i })
);

export const RequestSettings = ({ areas, currentArea }) => {
  const { setSidebarMode } = useAreasActions();
  const layers = useSelector(selectLayers);
  const selectOptionsAreas = useMemo(
    () => areas.map(({ name }) => ({ name, value: name })),
    [areas]
  );
  const selectOptionsLayers = useMemo(
    () => layers.map(({ name, id }) => ({ name, value: id })),
    [layers]
  );

  return (
    <>
      <Select items={selectOptionsAreas} value={currentArea.name} label='Choose area' />
      <Select items={selectOptionsLayers} label='Select layers' />
      <Select items={layerYears} label='Year' />

      <ButtonWrapper>
        <Button
          icon='ArrowInCircle'
          variant='secondary'
          padding={50}
          onClick={() => setSidebarMode(SIDEBAR_MODE.LIST)}
        >
          Back to list
        </Button>
        <Button variant='primary' onClick={() => {}}>
          Save changes
        </Button>
      </ButtonWrapper>
    </>
  );
};
