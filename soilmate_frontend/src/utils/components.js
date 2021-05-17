import { isFunction, isUndefined } from 'lodash-es';
import cn from 'classnames';

import { NOT_FORWARD_PROPS } from '_constants';

import { mergeObjects } from './helpers';

export const mergeProps = (initialProps, newProps) => {
  return mergeObjects(initialProps, newProps, (value, newValue, key) => {
    if (key.match(/children|ref|component|render/)) {
      return !isUndefined(newValue) ? newValue : value;
    }

    if (key.match('className')) return cn(value, newValue);

    if (isFunction(value)) {
      if (newValue === false) return undefined;
      return (...args) => {
        value?.(...args);
        newValue?.(...args);
      };
    }
  });
};

export const shouldForwardProp = prop => {
  return !NOT_FORWARD_PROPS.includes(prop);
};

export const getStyledComponentClassName = component => {
  return component.toString().replace(/^\./, '');
};
