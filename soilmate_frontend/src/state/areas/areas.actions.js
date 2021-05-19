import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { API } from 'api';

import { areasActions } from './areas.slice';
import { useAsync } from 'hooks';

export const useAreasActions = () => {
  const dispatch = useDispatch();
  const { isLoading, error, handleAsync } = useAsync();

  const getAreas = useCallback(async () => {
    await handleAsync(async () => {
      const getAreasResponse = await API.areas.getAreas();
      console.log(getAreasResponse);
    });
  }, [handleAsync]);

  return { isLoading, error, getAreas };
};
