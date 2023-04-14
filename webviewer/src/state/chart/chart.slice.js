import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_STATE = {
  data: null,
  layout: null
};

const chartSlice = createSlice({
  name: 'chart',
  initialState: DEFAULT_STATE,
  reducers: {
    setChartData: (state, action) => {
      state.data = action.payload.data;
      state.layout = action.payload.layout;
    },
    clearChart: () => DEFAULT_STATE
  }
});

export const selectChartData = state => state.chart;

export const { reducer: chartReducer, actions: chartActions } = chartSlice;
