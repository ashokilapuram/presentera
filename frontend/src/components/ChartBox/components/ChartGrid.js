import React from 'react';
import { Line } from 'react-konva';
import * as d3 from 'd3';

/**
 * Renders horizontal grid lines at Y-axis values
 */
const ChartGrid = ({ 
  chartType, 
  chartW, 
  chartH, 
  padding, 
  yScale, 
  hasNegativeValues, 
  minVal, 
  maxVal 
}) => {
  if (chartType === "pie") return null;
  
  const tickCount = 4;
  const domain = hasNegativeValues ? [minVal, maxVal] : [0, maxVal];
  const ticks = d3.ticks(domain[0], domain[1], tickCount);
  
  // Use lighter, solid grid lines for line charts for a more professional look
  const isLineChart = chartType === "line";
  const gridColor = isLineChart ? "#f3f4f6" : "#e5e7eb";
  const gridWidth = isLineChart ? 1 : 1.5;
  const gridDash = isLineChart ? [] : [4, 4]; // Solid lines for line charts
  
  return ticks.map((t, i) => (
    <Line
      key={i}
      points={[padding, yScale(t), chartW - padding, yScale(t)]}
      stroke={gridColor}
      strokeWidth={gridWidth}
      dash={gridDash}
      listening={false}
    />
  ));
};

export default ChartGrid;

