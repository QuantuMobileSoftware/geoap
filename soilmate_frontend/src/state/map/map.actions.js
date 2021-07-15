import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { mapActions } from './map.slice';

export const useMapActions = () => {
  const dispatch = useDispatch();

  const setEditableShape = useCallback(
    shape => dispatch(mapActions.setEditableShape(shape)),
    [dispatch]
  );

  return { setEditableShape };
};
