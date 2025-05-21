import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import { cloneDeep } from 'lodash-es';
import { Wrapper, CloseButton } from './Chart.styles';

const Plot = createPlotlyComponent(Plotly);

export const Chart = ({ chartData, onClose }) => {
  const layout = cloneDeep(chartData.layout) ?? {};

  return (
    <Wrapper>
      <CloseButton onClick={onClose}>×</CloseButton>
      <Plot
        data={cloneDeep(chartData.data)}
        layout={{
          width: 370,
          height: 290,
          ...layout
        }}
        config={{ displayModeBar: false }}
      />
    </Wrapper>
  );
};
