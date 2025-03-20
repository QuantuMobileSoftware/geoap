import styled from 'styled-components';
import { em } from 'styles';

export const Container = styled.main`
  display: flex;
  align-items: flex-start;
  height: calc(100vh - 102px); // 100% - header and filter
  gap: ${em(20)};
`;
