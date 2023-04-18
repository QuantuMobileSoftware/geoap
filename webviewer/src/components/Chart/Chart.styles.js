import styled from 'styled-components';

export const Wrapper = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: ${({ theme }) => theme.zIndexes[2]};
`;
