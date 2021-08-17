import React, { useState, useEffect } from 'react';
import { Modal } from 'components/_shared/Modal';
import { ModalItem } from 'components/_shared/ModalItem';
import { FileUploader } from 'components/_shared/FileUploader';
import { areasEvents } from '_events';

export const FieldsModal = ({ closeModal }) => {
  const [isOpenUploader, setIsOpenUploader] = useState(false);

  useEffect(() => {
    setIsOpenUploader(false);
  }, [isOpenUploader]);

  const handleOpenUploader = () => setIsOpenUploader(true);

  const handleNewRectangle = () => {
    areasEvents.createShape('Rectangle');
    closeModal();
  };
  const handleNewPolygon = () => {
    areasEvents.createShape('Polygon');
    closeModal();
  };

  const handleDetectField = () => console.log('detect');

  const newShapeFromFile = coordinates => {
    areasEvents.createShape('Polygon', coordinates);
    closeModal();
  };

  return (
    <Modal>
      <ModalItem
        header='Upload File'
        title='Please upload files in *.GeoJSOn or *.KML'
        icon='Upload'
        onClick={handleOpenUploader}
      >
        <FileUploader isOpen={isOpenUploader} createShape={newShapeFromFile} />
      </ModalItem>
      <ModalItem
        header='Detect'
        title='Lorem ipsum dolor sit amet'
        icon='Detect'
        onClick={handleDetectField}
      />
      <ModalItem
        header='Rectangle selection'
        title='Lorem ipsum dolor sit amet'
        icon='Rectangle'
        onClick={handleNewRectangle}
      />
      <ModalItem
        header='Polygon selection'
        title='Lorem ipsum dolor sit amet'
        icon='Polygon'
        onClick={handleNewPolygon}
      />
    </Modal>
  );
};
