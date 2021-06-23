import React from 'react';
import { StyledModalItem, ModalHeader, ModalTitle, Wrapper } from './ModalItem.styles';
import { Button } from '../Button';

export const ModalItem = ({ header, title, icon, children, ...props }) => {
  return (
    <StyledModalItem {...props}>
      <Wrapper>
        <div>
          <ModalHeader>{header}</ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </div>
        <Button icon={icon} />
      </Wrapper>
      {children}
    </StyledModalItem>
  );
};
