import { createSlice } from '@reduxjs/toolkit';

const MAP_INITIAL_STATE = {
  editableShape: null
};

const mapSlice = createSlice({
  name: 'map',
  initialState: MAP_INITIAL_STATE,
  reducers: {
    setEditableShape: (state, action) => {
      state.editableShape = action.payload;
    }
  }
});

export const getShapeCoords = state => state.map.editableShape;

export const { reducer: mapReducer, actions: mapActions } = mapSlice;
