import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { interfaceActions } from './interface.slice';

export const useInterfaceActions = () => {
  const dispatch = useDispatch();

  const setOpenContactUs = useCallback(
    value => dispatch(interfaceActions.setOpenContactUs(value)),
    [dispatch]
  );

  const hideWelcomeWindow = useCallback(
    () => dispatch(interfaceActions.hideWelcome()),
    [dispatch]
  );

  return { setOpenContactUs, hideWelcomeWindow };
};
