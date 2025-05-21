import styled from 'styled-components';

export const Wrapper = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: ${({ theme }) => theme.zIndexes[2]};
`;
export const CloseButton = styled.button`
  position: absolute;
  top: 4px;
  right: 6px;
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
  z-index: 1;

  &:hover {
    color: #e00;
  }
`;
