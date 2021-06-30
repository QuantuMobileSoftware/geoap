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
  StyledSidebar
} from './Sidebar.styles';

import { Modal } from '../Modal';
import { ModalItem } from '../ModalItem';

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
      });
    }, []);

    useImperativeHandle(ref, () => ({ element: rootRef.current, toggle }));

    if (!_isOpen && withUnmountToggle) return null;

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
          <Modal header='Creating new area'>
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
          </Modal>
        )}
      </StyledSidebar>
    );
  }
);
