import React from 'react';
import { areasEvents } from '_events';

import {
  StyledModalWrapper,
  StyledModalMain,
  CloseButton,
  ModalHeader
} from './Modal.styles';

export const Modal = ({ children, header, close, ...props }) => {
  const handleCloseClick = () => (close ? close() : areasEvents.toggleModal(false));

  return (
    <StyledModalWrapper {...props}>
      <StyledModalMain>
        <CloseButton icon='Cross' onClick={handleCloseClick} />
        {header && <ModalHeader>{header}</ModalHeader>}
        {children && children}
      </StyledModalMain>
    </StyledModalWrapper>
  );
};
