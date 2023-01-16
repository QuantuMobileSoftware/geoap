import { useLayoutEffect, useRef } from 'react';

const DEFAULT_PARAMS = {
  ignoredRefs: [],
  ignoredClassNames: []
};

export const useClickOutside = (elementRef, callback, params = DEFAULT_PARAMS) => {
  const callbackRef = useRef(callback);
  const paramsRef = useRef(params);

  useLayoutEffect(() => {
    const handleClick = event => {
      const target = event.target;

      if (!target || !elementRef?.current || !callbackRef.current) return;

      const { ignoredRefs, ignoredClassNames } = paramsRef.current;

      if (elementRef.current.contains(target)) return;

      if (ignoredRefs?.some(ref => ref?.current?.contains(target))) return;

      const isTargetContainsIgnoredClassName = ignoredClassNames?.some(className => {
        return [...Array.from(document.getElementsByClassName(className))].some(
          element => {
            return element.contains(target);
          }
        );
      });

      if (isTargetContainsIgnoredClassName) return;

      callbackRef.current(event);
    };

    document.addEventListener('click', handleClick, true);

    return () => document.removeEventListener('click', handleClick, true);
  }, [elementRef]);
};

export const UseClickOutsideConditional = props => {
  useClickOutside(props.elementRef, props.callback, props.params || {});
  return null;
};
