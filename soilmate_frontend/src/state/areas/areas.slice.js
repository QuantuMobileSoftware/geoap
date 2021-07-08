import { createSelector, createSlice } from '@reduxjs/toolkit';
import { omit } from 'lodash';

import { SIDEBAR_MODE } from '_constants';

const AREAS_INITIAL_STATE = {
  entities: {},
  current: null,
  mode: SIDEBAR_MODE.LIST
};

const areasSlice = createSlice({
  name: 'areas',
  initialState: AREAS_INITIAL_STATE,
  reducers: {
    setEntities: (state, action) => {
      state.entities = { ...state.entities, ...action.payload };
    },
    //set current area ID
    setCurrentArea: (state, action) => {
      state.current = action.payload;
    },
    deleteAreaById: (state, action) => {
      state.entities = omit(state.entities, action.payload);
    },
    setSidebarMode: (state, action) => {
      state.mode = action.payload;
    },
    updateArea: (state, action) => {
      const { id, area } = action.payload;
      const newArea = { [id]: { ...state.entities[id], ...area } };
      state.entities = { ...state.entities, ...newArea };
    }
  }
});

export const selectAreas = state => state.areas.entities;
//get current area ID
export const selectCurrentArea = state => state.areas.current;
export const selectSidebarMode = state => state.areas.mode;

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

export const { reducer: areasReducer, actions: areasActions } = areasSlice;
