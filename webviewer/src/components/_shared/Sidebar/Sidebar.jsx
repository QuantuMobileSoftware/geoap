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
  BreadcrumbsWrapper
} from './Sidebar.styles';

import { Modal } from '../Modal';
import { ModalItem } from '../ModalItem';
import { Button } from '../Button';
import { FileUploader } from '../FileUploader';
import { BreadCrumbs } from './BreadCrumbs';
import { MODAL_TYPE, SIDEBAR_MODE, SHAPE_NAMES } from '_constants';
import {
  useAreasActions,
  getSelectedEntitiesId,
  selectSidebarMode,
  selectCurrentArea,
  selectAreasList
} from 'state';

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
    const [prevAreaId, setPrevAreaId] = useState();
    const [isOpenUploader, setIsOpenUploader] = useState(false);
    const { deleteArea, setSidebarMode, deleteNewArea, setCurrentArea } =
      useAreasActions();
    const currentAreaId = useSelector(selectCurrentArea);
    const initialAreas = useSelector(selectAreasList);
    const selectedAreas = useSelector(getSelectedEntitiesId);
    const sidebarMode = useSelector(selectSidebarMode);

    const aoiType = sidebarMode === SIDEBAR_MODE.AREAS ? 'area' : 'field';
    const deleteAreasText =
      selectedAreas.length > 1
        ? `${selectedAreas.length} ${aoiType}s`
        : `this ${aoiType}`;

    const _className = cn(className, { isOpen: _isOpen });

    const handleClose = () => {
      setIsOpen(false);
      onClose?.();
    };

    const handleNewShape = shape => {
      areasEvents.toggleModal(false);
      areasEvents.createShape(shape);
    };

    const handleSaveField = () => {
      areasEvents.toggleModal(false);
      setSidebarMode(SIDEBAR_MODE.EDIT);
    };

    const handleCancelField = () => {
      setCurrentArea(prevAreaId);
      deleteNewArea(initialAreas.find(area => area.id === currentAreaId));
      areasEvents.toggleModal(false);
    };

    const newShapeFromFile = coordinates => {
      areasEvents.toggleModal(false);
      areasEvents.createShape(SHAPE_NAMES.POLYGON, coordinates);
    };

    const toggle = isOpen => {
      if (isOpen === _isOpen) return;
      if (!isUndefined(isOpen)) {
        setIsOpen(isOpen);
      } else {
        _isOpen ? handleClose() : setIsOpen(true);
      }
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
          setPrevAreaId(e.data.prevArea);
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
              icon='Rectangle'
              onClick={() => {
                handleNewShape(SHAPE_NAMES.RECTANGLE);
              }}
            />
            <ModalItem
              header='Polygon selection'
              icon='Polygon'
              onClick={() => {
                handleNewShape(SHAPE_NAMES.POLYGON);
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
            <Button variant='secondary' onClick={handleCancelField}>
              Cancel
            </Button>
            <Button variant='primary' onClick={handleSaveField}>
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
        <BreadcrumbsWrapper>
          <BreadCrumbs />
          {withCloseButton && <SidebarButtonClose onClick={handleClose} />}
        </BreadcrumbsWrapper>
        {heading && <SidebarHeading>{heading}</SidebarHeading>}
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
