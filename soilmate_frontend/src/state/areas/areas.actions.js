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

  const saveAreaRequest = useCallback(
    async (id, request) => {
      await handleAsync(async () => {
        const resp = await API.areas.saveAreaRequest(request);
        dispatch(areasActions.setAreaRequest({ id, request: resp.data }));
      });
    },
    [dispatch, handleAsync]
  );

  const setCurrentArea = useCallback(
    id => dispatch(areasActions.setCurrentArea(id)),
    [dispatch]
  );

  const setSelectedEntityId = useCallback(
    id => dispatch(areasActions.setSelectedEntityId(id)),
    [dispatch]
  );

  const deleteSelectedEntityId = useCallback(
    id => dispatch(areasActions.deleteSelectedEntityId(id)),
    [dispatch]
  );

  const saveArea = useCallback(
    async shape => {
      await handleAsync(async () => {
        const resp = await API.areas.saveArea(shape);
        dispatch(
          areasActions.setEntities(
            normalizeAreas([{ ...resp.data, requests: [], results: [] }])
          )
        );
        dispatch(areasActions.setCurrentArea(resp.data.id));
      }, true);
    },
    [handleAsync, dispatch]
  );

  const deleteArea = useCallback(
    async id => {
      await handleAsync(async () => {
        if (Array.isArray(id)) {
          Promise.all(id.map(id => API.areas.deleteArea(id))).then(resp => {
            const deletedEl = resp.map((el, i) => {
              if (el.status === 204) {
                return id[i];
              }
            });
            dispatch(areasActions.deleteAreaById(deletedEl));
            dispatch(areasActions.deleteSelectedEntityId());
          });
        } else {
          await API.areas.deleteArea(id);
          dispatch(areasActions.deleteAreaById(id));
        }
      }, true);
    },
    [handleAsync, dispatch]
  );

  const patchArea = useCallback(
    async (id, data) => {
      await handleAsync(async () => {
        const resp = await API.areas.patchArea(id, data);
        dispatch(areasActions.updateArea({ id, area: resp.data }));
      }, true);
    },
    [dispatch, handleAsync]
  );

  const setSidebarMode = useCallback(
    mode => dispatch(areasActions.setSidebarMode(mode)),
    [dispatch]
  );

  const getLayers = useCallback(async () => {
    await handleAsync(async () => {
      const resp = await API.areas.getLayers();
      dispatch(areasActions.setLayers(resp.data));
    });
  }, [dispatch, handleAsync]);

  return {
    isLoading,
    error,
    getAreas,
    setCurrentArea,
    setSelectedEntityId,
    deleteSelectedEntityId,
    saveArea,
    deleteArea,
    setSidebarMode,
    patchArea,
    getLayers,
    saveAreaRequest
  };
};
