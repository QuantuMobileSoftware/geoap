import React from 'react';
import { areasEvents } from '_events';

import {
  StyledModalWrapper,
  StyledModalMain,
  CloseButton,
  ModalHeader
} from './Modal.styles';

export const Modal = ({ children, header, ...props }) => {
  return (
    <StyledModalWrapper {...props}>
      <StyledModalMain>
        <CloseButton icon='Cross' onClick={() => areasEvents.toggleModal(false)} />
        {header && <ModalHeader>{header}</ModalHeader>}
        {children && children}
      </StyledModalMain>
    </StyledModalWrapper>
  );
};
