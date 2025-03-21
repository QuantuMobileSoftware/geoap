import styled from 'styled-components';
import { em, rem } from 'styles';

export const Container = styled.main`
  display: flex;
  align-items: flex-start;
  height: calc(100vh - 102px); // 100% - header and filter
  gap: ${em(20)};
`;

export const NoDataText = styled.h2`
  text-align: center;
  padding: ${em(10)};
  font-size: ${rem(20)};
`;
