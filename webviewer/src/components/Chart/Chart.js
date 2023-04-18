import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import { cloneDeep } from 'lodash-es';
import { Wrapper } from './Chart.styles';

const Plot = createPlotlyComponent(Plotly);

export const Chart = ({ chartData }) => {
  const layout = cloneDeep(chartData.layout) ?? {};

  return (
    <Wrapper>
      <Plot
        data={cloneDeep(chartData.data)}
        layout={{
          width: 320,
          height: 240,
          ...layout
        }}
        config={{ displayModeBar: false }}
      />
    </Wrapper>
  );
};
