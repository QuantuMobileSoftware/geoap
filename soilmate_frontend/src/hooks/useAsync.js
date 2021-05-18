import { useCallback, useEffect, useRef, useState } from 'react';

import { withFunction, mergeObjects } from 'utils';

const INITIAL_STATE = {
  error: '',
  isLoading: false
};

export const useAsync = () => {
  const isMounted = useRef(true);
  const [state, setState] = useState(INITIAL_STATE);

  const updateState = useCallback(state => {
    if (!isMounted.current) return;
    return setState(prevState => mergeObjects(prevState, state));
  }, []);

  // TODO: Add UI error notification
  const handleError = useCallback(error => {
    return Promise.reject(error);
  }, []);

  const handleAsync = useCallback(
    async callback => {
      updateState({ isLoading: true });

      try {
        const result = await withFunction(callback);
        updateState(INITIAL_STATE);
        return result;
      } catch (error) {
        updateState({ error, isLoading: false });
        return handleError(error);
      }
    },
    [updateState, handleError]
  );

  useEffect(() => () => (isMounted.current = false), []);

  return { ...state, setAsyncState: updateState, handleAsync, handleError };
};
