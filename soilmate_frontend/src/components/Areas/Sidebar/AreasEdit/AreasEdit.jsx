import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

import { selectCurrentArea, useAreasActions, selectUser, getShapeCoords } from 'state';
import { FormField, Form } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';
import { FileUploader } from 'components/_shared/FileUploader';
import { getPolygonPositions, getShapePositionsString } from 'utils/helpers';
import { SIDEBAR_MODE } from '_constants';
import { areasEvents } from '_events';
import {
  // AxisWrapper,
  // AxisInput,
  ButtonWrapper,
  Upload,
  UploadTitle
} from './AreasEdit.styles';

const validationSchema = Yup.object().shape({
  name: Yup.string().required()
});

export const AreasEdit = ({ areas }) => {
  const { setSidebarMode, patchArea } = useAreasActions();
  const currentUser = useSelector(selectUser);
  const currentAreaId = useSelector(selectCurrentArea);
  const editableShapeCoords = useSelector(getShapeCoords);
  const [isOpenUploader, setIsOpenUploader] = useState(false);
  const [shapeCoords, setShapeCoords] = useState(null);

  useEffect(() => {
    setIsOpenUploader(false);
  }, [isOpenUploader]);

  const currentArea = areas.find(area => area.id === currentAreaId);
  const latLangsCurrentArea = getPolygonPositions(currentArea).coordinates[0];

  const newShapeFromFile = coordinates => {
    areasEvents.createShape('Polygon', coordinates, false);
    setShapeCoords(coordinates);
  };

  const handleSaveArea = values => {
    const polygon = shapeCoords
      ? { polygon: getShapePositionsString(shapeCoords) }
      : editableShapeCoords
      ? { polygon: editableShapeCoords }
      : {};
    const areaData = {
      user: currentUser.pk,
      name: values.name,
      ...polygon
    };
    areasEvents.updateShape();
    patchArea(currentAreaId, areaData);
    setSidebarMode(SIDEBAR_MODE.LIST);
  };

  return (
    <Form
      initialValues={{
        name: currentArea.name,
        x: latLangsCurrentArea[0][0].toFixed(1),
        y: latLangsCurrentArea[0][1].toFixed(1)
      }}
      validationSchema={validationSchema}
    >
      {({ values }) => (
        <>
          <FormField autoFocus label='Name' name='name' placeholder='City...' />
          <Upload onClick={() => setIsOpenUploader(true)}>
            <Button icon='Upload'>Upload file</Button>
            <UploadTitle>Please upload files in *.GeoJSOn or *.KML</UploadTitle>
            <FileUploader isOpen={isOpenUploader} createShape={newShapeFromFile} />
          </Upload>
          {/* <AxisWrapper>
            <AxisInput type='number' label='X axis' name='x' />
            <AxisInput type='number' label='Y axis' name='y' />
          </AxisWrapper> */}
          <ButtonWrapper>
            <Button
              variant='secondary'
              padding={50}
              onClick={() => setSidebarMode(SIDEBAR_MODE.LIST)}
            >
              Cancel
            </Button>
            <Button variant='primary' onClick={() => handleSaveArea(values)}>
              Save changes
            </Button>
          </ButtonWrapper>
        </>
      )}
    </Form>
  );
};
