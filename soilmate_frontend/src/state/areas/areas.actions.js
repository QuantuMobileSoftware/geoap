import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { API } from 'api';

import { areasActions } from './areas.slice';
import { useAsync } from 'hooks';
import { normalizeAreas } from 'utils';

export const useAreasActions = () => {
  const dispatch = useDispatch();
  const { isLoading, error, handleAsync } = useAsync();

  const getAreas = useCallback(async () => {
    await handleAsync(async () => {
      const areas = (await API.areas.getAreas()).data;

      const areasWithFields = await Promise.all(
        areas.map(async area => {
          const [requests, results] = await Promise.all([
            API.areas.getAreaRequests(area.id),
            API.areas.getAreaResults(area.id)
          ]).then(responses => responses.map(({ data }) => data));

          return { ...area, requests, results };
        })
      );

      dispatch(areasActions.setEntities(normalizeAreas(areasWithFields)));
    });
  }, [dispatch, handleAsync]);

  return { isLoading, error, getAreas };
};
