import React from 'react';
import { Line, Circle } from 'react-konva';

const LineChart = ({ 
  seriesData, 
  labels, 
  xScale, 
  yScale, 
  animationProgress,
  onPointHover,
  onPointLeave
}) => {
  // Professional styling: slightly larger dots and smoother lines
  const dotRadius = 5;
  const lineWidth = 2.5;
  // Professional color palette matching the image: blue, orange, gray
  const seriesColors = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47', '#264478', '#9E480E'];
  
  return (
    <>
      {seriesData.map((series, seriesIndex) => {
        const points = (series.values || []).map((d, i) => [
          xScale(labels[i]) + xScale.bandwidth() / 2, 
          yScale(d)
        ]);
        const lineColor = (series.barColors && series.barColors[0]) || seriesColors[seriesIndex % seriesColors.length];
        
        return (
          <React.Fragment key={seriesIndex}>
            {/* Draw lines first (behind dots) */}
            {points.map(([x1, y1], i) => {
              if (i === points.length - 1) return null;
              const [x2, y2] = points[i + 1];
              
              return (
                <Line
                  key={`${seriesIndex}-line-${i}`}
                  points={[x1, y1, x2, y2]}
                  stroke={lineColor}
                  strokeWidth={lineWidth}
                  lineCap="round"
                  lineJoin="round"
                  opacity={animationProgress}
                  shadowBlur={0}
                  perfectDrawEnabled={true}
                />
              );
            })}
            
            {/* Draw dots on top of lines for better visibility */}
            {points.map(([x, y], i) => {
              const pointColor = (series.barColors && series.barColors[i]) || lineColor;
              const value = series.values[i];
              return (
                <Circle
                  key={`${seriesIndex}-point-${i}`}
                  x={x}
                  y={y}
                  radius={dotRadius}
                  fill={pointColor}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  opacity={animationProgress}
                  shadowBlur={0}
                  perfectDrawEnabled={true}
                  onMouseEnter={(e) => {
                    if (onPointHover) {
                      onPointHover({
                        x: x,
                        y: y,
                        value: value,
                        seriesName: series.name,
                        label: labels[i]
                      });
                    }
                    const stage = e.target.getStage();
                    if (stage) {
                      stage.container().style.cursor = 'pointer';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onPointLeave) {
                      onPointLeave();
                    }
                    const stage = e.target.getStage();
                    if (stage) {
                      stage.container().style.cursor = 'default';
                    }
                  }}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default LineChart;

