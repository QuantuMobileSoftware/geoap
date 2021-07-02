import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import cn from 'classnames';
import { isUndefined } from 'lodash-es';

import {
  SidebarBody,
  SidebarButtonClose,
  SidebarHeading,
  StyledSidebar,
  ButtonWrapper
} from './Sidebar.styles';

import { Modal } from '../Modal';
import { ModalItem } from '../ModalItem';
import { Button } from '../Button';
import { MODAL_TYPE } from '_constants';
import { useAreasActions } from 'state';

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
    const { deleteArea } = useAreasActions();

    const _className = cn(className, { isOpen: _isOpen });

    const handleClose = () => {
      setIsOpen(false);
      onClose?.();
    };

    const handleNewShape = shape => {
      areasEvents.toggleModal(false);
      areasEvents.createShape(shape);
    };

    const toggle = isOpen => {
      const shouldClose = (!isUndefined(isOpen) && !isOpen) || _isOpen;
      shouldClose ? handleClose() : setIsOpen(true);
    };

    useEffect(() => {
      return areasEvents.onToggleModal(e => {
        setIsModalOpen(e.isOpen);
        if (e.data) {
          setModalType(e.data.type);
          setRemovedAreaId(e.data.id);
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
            />
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
        header: 'Are you sure to delete this area?',
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
      }
    };

    return (
      <StyledSidebar
        {...props}
        ref={rootRef}
        className={_className}
        withUnmountToggle={withUnmountToggle}
      >
        {withCloseButton && <SidebarButtonClose onClick={handleClose} />}
        {heading && <SidebarHeading>{heading}</SidebarHeading>}
        {children && <SidebarBody>{children}</SidebarBody>}
        {isModalOpen && (
          <Modal header={modalChildren[modalType].header}>
            {modalChildren[modalType].content()}
          </Modal>
        )}
      </StyledSidebar>
    );
  }
);
