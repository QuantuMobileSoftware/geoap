import { createSlice } from '@reduxjs/toolkit';

const MAP_INITIAL_STATE = {
  editableShape: null,
  selectedLayerOpacity: 1
};

const mapSlice = createSlice({
  name: 'map',
  initialState: MAP_INITIAL_STATE,
  reducers: {
    setEditableShape: (state, action) => {
      state.editableShape = action.payload;
    },
    setLayerOpacity: (state, action) => {
      state.selectedLayerOpacity = action.payload;
    }
  }
});

export const getShapeCoords = state => state.map.editableShape;
export const getLayerOpacity = state => state.map.selectedLayerOpacity;

export const { reducer: mapReducer, actions: mapActions } = mapSlice;
