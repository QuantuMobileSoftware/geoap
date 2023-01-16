import React, { createElement } from 'react';
import { isString } from 'lodash-es';

import * as Icons from 'assets/icons';

import { StyledIcon } from './Icon.styles';

export const Icon = ({ children, ...props }) => {
  const renderIcon = () => {
    if (!children) return null;

    if (isString(children) && Icons[children]) {
      return createElement(Icons[children]);
    }

    return children;
  };

  return <StyledIcon {...props}>{renderIcon()}</StyledIcon>;
};
