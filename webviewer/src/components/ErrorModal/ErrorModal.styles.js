import styled from 'styled-components';
import { rem } from 'styles';

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: ${rem(24)};
  & button:first-child {
    border: ${({ theme }) => theme.borders.default(theme.fontSizes[2])};
  }
`;
