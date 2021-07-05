import React from 'react';
import { useSelector } from 'react-redux';

import { selectCurrentArea, useAreasActions } from 'state';
import { FormField, Form } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';
import { getPolygonPositions } from 'utils/helpers';
import { AREA_MODE } from '_constants';
import { AxisWrapper, AxisInput, ButtonWrapper } from './AreasEdit.styles';

export const AreasEdit = ({ areas }) => {
  const { setAreaMode } = useAreasActions();
  const currentAreaId = useSelector(selectCurrentArea);
  const currentArea = areas.find(area => area.id === currentAreaId);
  const latLangsCurrentArea = getPolygonPositions(currentArea).coordinates[0];
  return (
    <Form
      initialValues={{
        city: currentArea.name,
        x: latLangsCurrentArea[0][0].toFixed(1),
        y: latLangsCurrentArea[0][1].toFixed(1)
      }}
    >
      {() => (
        <>
          <FormField label='Name' name='city' placeholder='City...' />
          <AxisWrapper>
            <AxisInput type='number' label='X axis' name='x' />
            <AxisInput type='number' label='Y axis' name='y' />
          </AxisWrapper>
          <ButtonWrapper>
            <Button
              variant='secondary'
              padding={50}
              onClick={() => setAreaMode(AREA_MODE.LIST)}
            >
              Cancel
            </Button>
            <Button variant='primary'>Save changes</Button>
          </ButtonWrapper>
        </>
      )}
    </Form>
  );
};
