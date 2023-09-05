import styled from 'styled-components';
import { em } from 'styles';

export const Container = styled.main`
  max-width: 1280px;
  margin: auto;
  padding: ${em(20)} ${em(60)};
  color: #182b1c;
  h1 {
    font-weight: 500;
    font-size: 2.3em;
  }
  span {
    font-size: 0.7em;
  }
  ol,
  ul {
    margin: 1em;
    list-style: auto;
    font-weight: 500;
    font-size: 1.5em;
    p {
      font-size: 0.65em;
      margin-left: -1.5em;
      font-weight: 400;
    }
    h3 {
      font-size: inherit;
      font-weight: inherit;
    }
    ul {
      font-size: 1em;
      font-weight: 100;
      margin-top: 0;
      margin-left: 2em;
    }
    ol {
      font-size: 1em;
      font-weight: 100;
      margin-top: 0;
      margin-left: 2em;
      list-style: outside;
    }
  }
  p {
    font-weight: 400;
    margin-bottom: 1em;
    b {
      font-weight: 500;
    }
  }
  h3 {
    font-weight: 500;
    font-size: 1.5em;
  }
`;
