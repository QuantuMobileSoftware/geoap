import { createSelector, createSlice } from '@reduxjs/toolkit';
import { omit } from 'lodash';

import { SIDEBAR_MODE } from '_constants';

const AREAS_INITIAL_STATE = {
  entities: {},
  selectedEntitiesId: [],
  current: null,
  selectedResults: [],
  mode: SIDEBAR_MODE.AREAS,
  layers: [],
  isLoading: false
};

const areasSlice = createSlice({
  name: 'areas',
  initialState: AREAS_INITIAL_STATE,
  reducers: {
    setDefaultState: () => {
      return AREAS_INITIAL_STATE;
    },
    setEntities: (state, action) => {
      state.entities = { ...state.entities, ...action.payload };
    },
    setEntity: (state, action) => {
      state.entities[action.payload.id] = {
        ...state.entities[action.payload.id],
        ...action.payload
      };
    },
    setEntitySize: (state, action) => {
      state.entities[action.payload.id].size = action.payload.size;
    },
    setSelectedEntityId: (state, action) => {
      state.selectedEntitiesId.push(action.payload);
    },
    deleteSelectedEntityId: (state, action) => {
      if (action.payload) {
        state.selectedEntitiesId = state.selectedEntitiesId.filter(
          el => el !== action.payload
        );
      } else {
        state.selectedEntitiesId = [];
      }
    },
    //set current area ID
    setCurrentArea: (state, action) => {
      state.current = action.payload;
    },
    setSelectedResult: (state, action) => {
      state.selectedResults.push(action.payload);
    },
    deleteSelectedResult: (state, action) => {
      if (action.payload) {
        state.selectedResults = state.selectedResults.filter(el => el !== action.payload);
      } else {
        state.selectedResults = [];
      }
    },
    deleteAreaById: (state, action) => {
      state.entities = omit(state.entities, action.payload);
    },
    setSidebarMode: (state, action) => {
      state.mode = action.payload;
    },
    updateArea: (state, action) => {
      const id = state.current;
      const newArea = { [id]: { ...state.entities[id], ...action.payload } };
      state.entities = { ...state.entities, ...newArea };
    },
    setAreaRequest: (state, action) => {
      const { id, request } = action.payload;
      state.entities[id].requests[request.id] = request;
    },
    setLayers: (state, action) => {
      state.layers = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  }
});

export const getLoading = state => state.areas.isLoading;
export const selectAreas = state => state.areas.entities;
//get current area ID
export const selectCurrentArea = state => state.areas.current;
export const getSelectedResults = state => state.areas.selectedResults;
export const selectSidebarMode = state => state.areas.mode;
export const getSelectedEntitiesId = state => state.areas.selectedEntitiesId;

export const selectAreasList = createSelector(selectAreas, areas => {
  return Object.values(areas).map(area => ({
    ...area,
    requests: Object.values(area.requests),
    results: Object.values(area.results)
  }));
});

export const selectAreasResults = createSelector(selectAreasList, areas => {
  return areas.flatMap(({ results }) => results);
});

export const selectAreasRequests = createSelector(selectAreasList, areas => {
  return areas.flatMap(({ requests }) => requests);
});

export const selectCurrentRequests = createSelector(
  selectAreasList,
  selectCurrentArea,
  (areas, areaID) => {
    return areas.flatMap(({ requests }) => requests).filter(i => i.aoi === areaID);
  }
);

export const selectCurrentResults = createSelector(
  selectAreasList,
  selectCurrentArea,
  (areas, areaId) => {
    return areas.find(({ id }) => id === areaId)?.results;
  }
);

export const selectLayers = state => state.areas.layers;

export const { reducer: areasReducer, actions: areasActions } = areasSlice;
