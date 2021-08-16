import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

import { useAreasActions, selectUser, getShapeCoords } from 'state';
import { FormField, Form } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';
import { FileUploader } from 'components/_shared/FileUploader';
import { getPolygonPositions, getShapePositionsString } from 'utils/helpers';
import { SIDEBAR_MODE } from '_constants';
import { areasEvents } from '_events';
import {
  ButtonWrapper,
  Upload,
  UploadTitle,
  StyledModal,
  ModalButtonWrapper,
  ModalText
} from './AreasEdit.styles';

const validationSchema = Yup.object().shape({
  name: Yup.string().required()
});

export const AreasEdit = ({ currentArea }) => {
  const { setSidebarMode, patchArea } = useAreasActions();
  const currentUser = useSelector(selectUser);
  const editableShapeCoords = useSelector(getShapeCoords);
  const [isOpenUploader, setIsOpenUploader] = useState(false);
  const [shapeCoords, setShapeCoords] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    setIsOpenUploader(false);
  }, [isOpenUploader]);

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
    patchArea(currentArea.id, areaData);
    setSidebarMode(SIDEBAR_MODE.LIST);
  };

  const handleToggleModal = isOpen => () => setIsOpenModal(isOpen);

  const handleDownloadClick = () => {
    setIsOpenModal(false);
    setIsOpenUploader(true);
  };

  const handleSidebarMode = () => setSidebarMode(SIDEBAR_MODE.LIST);

  return (
    <>
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
            <Upload>
              <Button icon='Upload' onClick={handleToggleModal(true)}>
                Upload file
              </Button>
              <UploadTitle>Please upload files in *.GeoJSOn or *.KML</UploadTitle>
              <FileUploader isOpen={isOpenUploader} createShape={newShapeFromFile} />
            </Upload>
            <ButtonWrapper>
              <Button variant='secondary' padding={50} onClick={handleSidebarMode}>
                Cancel
              </Button>
              <Button variant='primary' onClick={() => handleSaveArea(values)}>
                Save changes
              </Button>
            </ButtonWrapper>
          </>
        )}
      </Form>
      {isOpenModal && (
        <StyledModal
          header='Are you sure to download new file?'
          close={handleToggleModal(false)}
        >
          <>
            <ModalText>
              When the new file is downloaded, the old file will be deleted automatically
            </ModalText>
            <ModalButtonWrapper>
              <Button variant='secondary' onClick={handleToggleModal(false)}>
                Cancel
              </Button>
              <Button variant='primary' onClick={handleDownloadClick}>
                Yes, Download
              </Button>
            </ModalButtonWrapper>
          </>
        </StyledModal>
      )}
    </>
  );
};
