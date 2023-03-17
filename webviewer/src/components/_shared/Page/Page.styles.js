import { cloneElement } from 'react';
import styled from 'styled-components';
import cn from 'classnames';

import { shouldForwardProp } from 'utils';

export const PageHeader = styled(({ children, ...props }) => {
  const className = cn(children.props.className, props.className);
  return cloneElement(children, { ...props, className });
})``;

export const StyledPage = styled.div.withConfig({ shouldForwardProp })`
  width: 100vw;
  max-width: 100vw;
  min-width: 320px;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
`;
