import { createSelector, createSlice } from '@reduxjs/toolkit';

const AREAS_INITIAL_STATE = {
  entities: {}
};

const areasSlice = createSlice({
  name: 'areas',
  initialState: AREAS_INITIAL_STATE,
  reducers: {
    setEntities: (state, action) => {
      state.entities = action.payload;
    }
  }
});

export const { reducer: areasReducer, actions: areasActions } = areasSlice;

export const selectAreas = state => state.areas.entities;

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
