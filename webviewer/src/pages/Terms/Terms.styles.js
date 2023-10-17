import styled from 'styled-components';
import { em } from 'styles';

import { Link } from '../../components/_shared/Link';

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
`;

export const MainTitle = styled.h1`
  font-weight: 500;
  font-size: 2.3em;
`;

export const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  padding: 10px 15px;
  border: 1px solid;
  border-radius: 20px;
`;

export const Version = styled.span`
  font-size: 0.7em;
`;

export const Container = styled.main`
  max-width: 1280px;
  margin: auto;
  padding: ${em(20)} ${em(60)};
  color: #182b1c;
`;
