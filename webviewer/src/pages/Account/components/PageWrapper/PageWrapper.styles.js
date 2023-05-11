import styled from 'styled-components';
import { em } from 'styles';
import { Typography } from 'components/_shared/Typography';

export const Header = styled(Typography).attrs({
  element: 'h1',
  variant: 'h2'
})`
  color: ${({ theme }) => theme.colors.nature.n4};
`;

export const Wrapper = styled.div`
  padding: ${em(22)} ${em(42)};
  background: ${({ theme }) => theme.colors.nature.n1};
  flex-grow: 1;
  overflow-y: auto;
`;
