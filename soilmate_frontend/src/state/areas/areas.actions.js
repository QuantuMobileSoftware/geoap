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

  const setCurrentArea = useCallback(
    id => dispatch(areasActions.setCurrentArea(id)),
    [dispatch]
  );

  const saveArea = useCallback(
    async shape => {
      await handleAsync(async () => {
        const area = await (await API.areas.saveArea(shape)).data;
        dispatch(
          areasActions.setEntities(
            normalizeAreas([{ ...area, requests: [], results: [] }])
          )
        );
      });
    },
    [handleAsync, dispatch]
  );

  const deleteArea = useCallback(
    async id => {
      await handleAsync(async () => {
        const resp = await API.areas.deleteArea(id);
        if (resp.status >= 400) return;
        dispatch(areasActions.deleteAreaById(id));
      });
    },
    [handleAsync, dispatch]
  );

  return { isLoading, error, getAreas, setCurrentArea, saveArea, deleteArea };
};
