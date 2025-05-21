import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { chartActions } from './chart.slice';

export const useChartActions = () => {
  const dispatch = useDispatch();

  const setChartData = useCallback(
    data => dispatch(chartActions.setChartData(data)),
    [dispatch]
  );
  const clearChart = useCallback(() => dispatch(chartActions.clearChart()), [dispatch]);

  return { setChartData, clearChart };
};
