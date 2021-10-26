import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Modal } from 'components/_shared/Modal';
import { ModalItem } from 'components/_shared/ModalItem';
import { FileUploader } from 'components/_shared/FileUploader';

import { areasEvents } from '_events';
import { SIDEBAR_MODE, SHAPE_NAMES, AOI_TYPE } from '_constants';
import { selectAreas, useAreasActions } from 'state';

import { StyledSelect, ModalText } from './FieldsModal.styles';

const fieldsBoundariesName = "Fields' boundaries";

const hasBoundariesFields = ({ name }) => name === fieldsBoundariesName;

export const FieldsModal = ({ closeModal }) => {
  const areasList = useSelector(selectAreas);
  const { setCurrentArea, setSidebarMode, setSelectedResult } = useAreasActions();
  const [isOpenUploader, setIsOpenUploader] = useState(false);
  const [isDetectedModal, setIsDetectedModal] = useState(false);

  const filteredAreas = useMemo(
    () =>
      Object.values(areasList)
        .filter(item => {
          if (item.type === AOI_TYPE.FIELD) {
            return false;
          }
          return Object.values(item.results).some(hasBoundariesFields);
        })
        .map(({ id, name, results }) => ({
          value: id,
          name,
          result: Object.values(results).find(hasBoundariesFields).id
        })),
    [areasList]
  );

  useEffect(() => {
    setIsOpenUploader(false);
  }, [isOpenUploader]);

  const handleOpenUploader = () => setIsOpenUploader(true);

  const handleNewRectangle = () => {
    areasEvents.createShape(SHAPE_NAMES.RECTANGLE);
    closeModal();
  };
  const handleNewPolygon = () => {
    areasEvents.createShape(SHAPE_NAMES.POLYGON);
    closeModal();
  };

  const handleDetectField = () => setIsDetectedModal(true);

  const handleSelectChange = ({ value, result }) => {
    closeModal();
    setCurrentArea(value);
    setSidebarMode(SIDEBAR_MODE.REQUESTS);
    setSelectedResult(result);
  };

  const newShapeFromFile = coordinates => {
    areasEvents.createShape(SHAPE_NAMES.POLYGON, coordinates);
    closeModal();
  };

  const createModalElements = (
    <>
      <ModalItem
        header='Upload File'
        title='Please upload files in *.GeoJSOn or *.KML'
        icon='Upload'
        onClick={handleOpenUploader}
      >
        <FileUploader isOpen={isOpenUploader} createShape={newShapeFromFile} />
      </ModalItem>
      <ModalItem header='Detect' icon='Detect' onClick={handleDetectField} />
      <ModalItem
        header='Rectangle selection'
        icon='Rectangle'
        onClick={handleNewRectangle}
      />
      <ModalItem header='Polygon selection' icon='Polygon' onClick={handleNewPolygon} />
    </>
  );

  const selectAreaElements = filteredAreas.length ? (
    <StyledSelect
      items={filteredAreas}
      placeholder='Choose area'
      onSelect={handleSelectChange}
    />
  ) : (
    <ModalText>
      No areas detected.
      <br /> You can create new area to add field
    </ModalText>
  );

  return (
    <Modal close={closeModal} header='Creating new field'>
      {isDetectedModal ? selectAreaElements : createModalElements}
    </Modal>
  );
};
