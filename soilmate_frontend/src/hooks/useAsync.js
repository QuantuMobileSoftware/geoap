import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { areasActions } from 'state/areas/areas.slice';

import { withFunction, mergeObjects } from 'utils';

const INITIAL_STATE = {
  error: '',
  isLoading: false
};

export const useAsync = () => {
  const isMounted = useRef(true);
  const [state, setState] = useState(INITIAL_STATE);
  const dispatch = useDispatch();

  const updateState = useCallback(state => {
    if (!isMounted.current) return;
    return setState(prevState => mergeObjects(prevState, state));
  }, []);

  // TODO: Add UI error notification
  const handleError = useCallback(error => {
    return Promise.reject(error);
  }, []);

  const handleAsync = useCallback(
    async (callback, loader = false) => {
      updateState({ isLoading: true });
      let result;
      if (loader) {
        dispatch(areasActions.setLoading(true));
      }
      try {
        result = await withFunction(callback);
        updateState(INITIAL_STATE);
      } catch (error) {
        updateState({ error, isLoading: false });
        result = handleError(error);
      }
      if (loader) {
        dispatch(areasActions.setLoading(false));
      }
      return result;
    },
    [updateState, handleError, dispatch]
  );

  useEffect(() => () => (isMounted.current = false), []);

  return { ...state, setAsyncState: updateState, handleAsync, handleError };
};
