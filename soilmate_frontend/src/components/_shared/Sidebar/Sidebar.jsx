import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import { isUndefined } from 'lodash-es';

import {
  SidebarBody,
  SidebarButtonClose,
  SidebarHeading,
  StyledSidebar,
  ButtonWrapper,
  SidebarHeader
} from './Sidebar.styles';

import { Modal } from '../Modal';
import { ModalItem } from '../ModalItem';
import { Button } from '../Button';
import { FileUploader } from '../FileUploader';
import { BreadCrumbs } from './BreadCrumbs';
import { useAreaData } from 'hooks';
import { MODAL_TYPE, SIDEBAR_MODE, AOI_TYPE } from '_constants';
import { useAreasActions, selectSelectedEntitiesId } from 'state';

import { areasEvents } from '_events';

export const Sidebar = forwardRef(
  (
    {
      className,
      children,
      heading,
      isOpen = false,
      isShowModal = false,
      withUnmountToggle = true,
      withCloseButton = true,
      onClose,
      ...props
    },
    ref
  ) => {
    const rootRef = useRef(null);

    const [_isOpen, setIsOpen] = useState(isOpen);
    useEffect(() => isOpen && setIsOpen(isOpen), [isOpen]);

    const [isModalOpen, setIsModalOpen] = useState(isShowModal);
    const [modalType, setModalType] = useState(MODAL_TYPE.SAVE);
    const [removedAreaId, setRemovedAreaId] = useState();
    const [fieldCoords, setFieldCoords] = useState();
    const [isOpenUploader, setIsOpenUploader] = useState(false);
    const { deleteArea, saveArea, setSidebarMode } = useAreasActions();
    const selectedAreas = useSelector(selectSelectedEntitiesId);
    const fieldData = useAreaData(fieldCoords, AOI_TYPE.FIELD);

    const deleteAreasText =
      selectedAreas.length > 1 ? `${selectedAreas.length} areas` : 'this area';

    const _className = cn(className, { isOpen: _isOpen });

    const handleClose = () => {
      setIsOpen(false);
      onClose?.();
    };

    const handleNewShape = shape => {
      areasEvents.toggleModal(false);
      areasEvents.createShape(shape);
    };

    const newShapeFromFile = coordinates => {
      areasEvents.toggleModal(false);
      areasEvents.createShape('Polygon', coordinates);
    };

    const toggle = isOpen => {
      const shouldClose = (!isUndefined(isOpen) && !isOpen) || _isOpen;
      shouldClose ? handleClose() : setIsOpen(true);
    };

    useEffect(() => {
      setIsOpenUploader(false);
    }, [isOpenUploader]);

    useEffect(() => {
      return areasEvents.onToggleModal(e => {
        setIsModalOpen(e.isOpen);
        if (e.data) {
          setModalType(e.data.type);
          setRemovedAreaId(e.data.id);
          setFieldCoords(e.data.coordinates);
        }
      });
    }, []);

    useImperativeHandle(ref, () => ({ element: rootRef.current, toggle }));

    if (!_isOpen && withUnmountToggle) return null;

    const modalChildren = {
      [MODAL_TYPE.SAVE]: {
        header: 'Creating new area',
        content: () => (
          <>
            <ModalItem
              header='Upload File'
              title='Please upload files in *.GeoJSOn or *.KML'
              icon='Upload'
              onClick={() => setIsOpenUploader(true)}
            >
              <FileUploader isOpen={isOpenUploader} createShape={newShapeFromFile} />
            </ModalItem>
            <ModalItem
              header='Rectangle selection'
              title='Lorem ipsum dolor sit amet'
              icon='Rectangle'
              onClick={() => {
                handleNewShape('Rectangle');
              }}
            />
            <ModalItem
              header='Polygon selection'
              title='Lorem ipsum dolor sit amet'
              icon='Polygon'
              onClick={() => {
                handleNewShape('Polygon');
              }}
            />
          </>
        )
      },
      [MODAL_TYPE.DELETE]: {
        header: `Are you sure to delete \n ${deleteAreasText}?`,
        content: () => (
          <ButtonWrapper>
            <Button variant='secondary' onClick={() => areasEvents.toggleModal(false)}>
              Cancel
            </Button>
            <Button
              variant='primary'
              onClick={() => {
                deleteArea(removedAreaId);
                areasEvents.toggleModal(false);
                setRemovedAreaId(null);
              }}
            >
              Yes, delete
            </Button>
          </ButtonWrapper>
        )
      },
      [MODAL_TYPE.SAVE_FIELD]: {
        header: 'Do you want to proceed to save the field?',
        content: () => (
          <ButtonWrapper>
            <Button variant='secondary' onClick={() => areasEvents.toggleModal(false)}>
              Cancel
            </Button>
            <Button
              variant='primary'
              onClick={async () => {
                areasEvents.toggleModal(false);
                await saveArea(fieldData);
                setSidebarMode(SIDEBAR_MODE.EDIT);
              }}
            >
              Yes, save
            </Button>
          </ButtonWrapper>
        )
      }
    };

    return (
      <StyledSidebar
        {...props}
        ref={rootRef}
        className={_className}
        withUnmountToggle={withUnmountToggle}
      >
        <BreadCrumbs />
        <SidebarHeader>
          {heading && <SidebarHeading>{heading}</SidebarHeading>}
          {withCloseButton && <SidebarButtonClose onClick={handleClose} />}
        </SidebarHeader>
        {children && <SidebarBody>{children}</SidebarBody>}
        {isModalOpen && (
          <Modal
            header={modalChildren[modalType].header}
            textCenter={modalType !== MODAL_TYPE.SAVE}
          >
            {modalChildren[modalType].content()}
          </Modal>
        )}
      </StyledSidebar>
    );
  }
);
