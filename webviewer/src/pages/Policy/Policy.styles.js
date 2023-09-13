import styled from 'styled-components';
import { em } from 'styles';

export const Container = styled.main`
  max-width: 1280px;
  margin: auto;
  padding: ${em(20)} ${em(60)};

  h1 {
    font-weight: 500;
    font-size: 2.3em;
  }

  ol,
  ul {
    list-style: none;
    font-weight: 500;
    font-size: 1.5em;
    counter-reset: section;

    li {
      margin-bottom: 1em;
      line-height: 1.5;
    }

    li:before {
      counter-increment: section;
      content: counters(section, '.') ' ';
      margin-right: 1em;
    }

    ol {
      margin: 0;
      counter-reset: subsection;
      font-size: initial;
      font-weight: 100;

      li {
        margin-bottom: 10px;
        line-height: 1.5;
        p {
          margin-bottom: 1em;
        }
        b {
          font-weight: 500;
          font-size: 1.2em;
        }
      }

      li:before {
        counter-increment: subsection;
        content: counters(section, '.') '.' counters(subsection, '.') ' ';
        margin-right: 1em;
        font-weight: 300;
      }
    }
    ul {
      margin: 0;
      counter-reset: subsection;
      margin: 0.3em;

      li {
        margin-bottom: 0;
        line-height: 1.5;
        font-size: initial;
        font-weight: 100;
        margin-left: 2em;
      }

      li:before {
        counter-increment: subsection;
        content: '(' counter(subsection, lower-alpha) ') '; /* Use lower-case alphabets for top-level items */
        margin-right: 0.5em;
        font-size: 0.8em;
        font-weight: 300;
      }
    }
  }
`;
