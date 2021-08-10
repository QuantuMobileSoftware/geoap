import React from 'react';
import { areasEvents } from '_events';

import {
  StyledModalWrapper,
  StyledModalMain,
  CloseButton,
  ModalHeader
} from './Modal.styles';

export const Modal = ({ children, header, close, textCenter, ...props }) => {
  return (
    <StyledModalWrapper {...props}>
      <StyledModalMain textCenter={textCenter}>
        <CloseButton
          icon='Cross'
          onClick={() => (close ? close() : areasEvents.toggleModal(false))}
        />
        {header && <ModalHeader>{header}</ModalHeader>}
        {children && children}
      </StyledModalMain>
    </StyledModalWrapper>
  );
};
