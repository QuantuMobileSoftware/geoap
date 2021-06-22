import styled from 'styled-components';
import { Button } from '../Button';
import { Typography } from '../Typography';

export const StyledModalWrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  opacity: 0.9;
  background: rgba(0, 0, 0, 0.8);
`;

export const StyledModalMain = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  min-width: 250px;
  padding: 27px 20px;
  transform: translate(-50%, -50%);
  background: #ffffff;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  color: #182b1c;
`;

export const CloseButton = styled(Button)`
  position: absolute;
  top: 23px;
  right: 17px;
`;

export const ModalHeader = styled(Typography).attrs({
  element: 'h2',
  variant: 'h1'
})`
  margin-bottom: 23px;
`;
