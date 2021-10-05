import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { isEmpty } from 'lodash';

import { useAreasActions, selectUser, getShapeCoords } from 'state';
import { FormField, Form } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';
import { FileUploader } from 'components/_shared/FileUploader';
import { Modal } from 'components/_shared/Modal';
import { getPolygonPositions, getShapePositionsString } from 'utils/helpers';
import { SIDEBAR_MODE, AOI_TYPE, SHAPE_NAMES } from '_constants';
import { areasEvents } from '_events';
import {
  ButtonWrapper,
  Upload,
  UploadTitle,
  ModalButtonWrapper,
  ModalText
} from './AreasEdit.styles';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required()
    .max(200, 'The Area Name field contains more than 200 characters')
});

export const AreasEdit = ({ currentArea }) => {
  const { setSidebarMode, patchArea, deleteNewArea, setCurrentArea, saveArea, error } =
    useAreasActions();
  const currentUser = useSelector(selectUser);
  const editableShapeCoords = useSelector(getShapeCoords);
  const [isOpenUploader, setIsOpenUploader] = useState(false);
  const [shapeCoords, setShapeCoords] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [errorName, setErrorName] = useState();

  const { AREAS, FIELDS } = SIDEBAR_MODE;

  const mode = currentArea.type === AOI_TYPE.AREA ? AREAS : FIELDS;

  useEffect(() => {
    if (error.status === 400) {
      setErrorName(error.data.name);
    }
  }, [error]);

  useEffect(() => {
    setIsOpenUploader(false);
  }, [isOpenUploader]);

  const latLangsCurrentArea = getPolygonPositions(currentArea).coordinates[0];

  const newShapeFromFile = coordinates => {
    areasEvents.createShape(SHAPE_NAMES.POLYGON, coordinates, false);
    setShapeCoords(coordinates);
  };

  const handleSaveArea = values => async () => {
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
    if (currentArea.isTemporary) {
      if (!areaData.polygon) {
        areaData.polygon = currentArea.polygon;
      }
      await saveArea({ ...areaData, type: currentArea.type });
      deleteNewArea(currentArea);
    } else {
      await patchArea(currentArea.id, areaData);
    }
    areasEvents.updateShape();
    setSidebarMode(mode);
  };

  const handleOpenModal = () => setIsOpenModal(true);
  const handleCloseModal = () => setIsOpenModal(false);

  const handleDownloadClick = () => {
    setIsOpenModal(false);
    setIsOpenUploader(true);
  };

  const handleCloseEditing = () => {
    setCurrentArea(null);
    deleteNewArea(currentArea);
    setSidebarMode(mode);
  };

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
        {({ values, errors }) => (
          <>
            <FormField
              autoFocus
              label='Name'
              name='name'
              placeholder='City...'
              error={errorName}
              onBlur={() => setErrorName('')}
            />
            <Upload>
              <Button icon='Upload' onClick={handleOpenModal}>
                Upload file
              </Button>
              <UploadTitle>Please upload files in *.GeoJSOn or *.KML</UploadTitle>
              <FileUploader isOpen={isOpenUploader} createShape={newShapeFromFile} />
            </Upload>
            <ButtonWrapper>
              <Button variant='secondary' padding={50} onClick={handleCloseEditing}>
                Cancel
              </Button>
              <Button
                variant='primary'
                onClick={handleSaveArea(values)}
                disabled={!isEmpty(errors)}
              >
                Save changes
              </Button>
            </ButtonWrapper>
          </>
        )}
      </Form>
      {isOpenModal && (
        <Modal
          header='Are you sure to download new file?'
          textCenter={true}
          close={handleCloseModal}
        >
          <>
            <ModalText>
              When the new file is downloaded, the old file will be deleted automatically
            </ModalText>
            <ModalButtonWrapper>
              <Button variant='secondary' onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant='primary' onClick={handleDownloadClick}>
                Yes, Download
              </Button>
            </ModalButtonWrapper>
          </>
        </Modal>
      )}
    </>
  );
};
