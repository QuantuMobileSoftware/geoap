import { createSlice } from '@reduxjs/toolkit';
import { normalizeAreas } from 'utils';

const AREAS_INITIAL_STATE = {
  entities: {}
};

const areasSlice = createSlice({
  name: 'areas',
  initialState: AREAS_INITIAL_STATE,
  reducers: {
    setEntities: {
      prepare: areas => ({ payload: normalizeAreas(areas) }),
      reducer: (state, action) => {
        state.entities = action.payload;
      }
    }
  }
});

export const { reducer: areasReducer, actions: areasActions } = areasSlice;

export const selectAreas = state => state.areas;
