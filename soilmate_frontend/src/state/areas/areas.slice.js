import { createSelector, createSlice } from '@reduxjs/toolkit';

const AREAS_INITIAL_STATE = {
  entities: {},
  current: null
};

const areasSlice = createSlice({
  name: 'areas',
  initialState: AREAS_INITIAL_STATE,
  reducers: {
    setEntities: (state, action) => {
      state.entities = action.payload;
    },
    setCurrentArea: (state, action) => {
      state.current = action.payload;
    }
  }
});

export const { reducer: areasReducer, actions: areasActions } = areasSlice;

export const selectAreas = state => state.areas.entities;
export const selecCurrentArea = state => state.areas.current;

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
