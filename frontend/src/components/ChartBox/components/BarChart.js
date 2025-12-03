import React from 'react';
import { Shape } from 'react-konva';
import { createBarGradient, applyShadow, clearShadow } from '../utils/chartGradients';

/**
 * Renders bar chart with gradients and shadows for realistic 3D effect
 */
const BarChart = ({ 
  seriesData, 
  labels, 
  xScale, 
  yScale, 
  barAnimations, 
  defaultColor,
  onBarHover,
  onBarLeave
}) => {
  if (!labels || labels.length === 0 || seriesData.length === 0) {
    return null;
  }
  
  // Calculate bar width to fit all series side by side
  const barWidth = xScale.bandwidth() / seriesData.length;
  const gap = barWidth * 0.1; // Small gap between bars
  const actualBarWidth = barWidth - gap;
  
  const bars = [];
  
  // Render bars for each label
  labels.forEach((label, labelIndex) => {
    // Render one bar per series for this label
    seriesData.forEach((series, seriesIndex) => {
      const value = series.values[labelIndex] ?? 0;
      const barX = xScale(label) + (seriesIndex * barWidth) + (gap / 2);
      const barAnimation = barAnimations[`${labelIndex}-${seriesIndex}`];
      
      let currentValue;
      if (barAnimation && barAnimation.progress < 1) {
        currentValue = barAnimation.startValue + (barAnimation.finalValue - barAnimation.startValue) * barAnimation.progress;
      } else {
        currentValue = value;
      }
      
      const barY = yScale(Math.max(0, currentValue));
      const barHeight = Math.abs(yScale(currentValue) - yScale(0));
      const isNegative = currentValue < 0;
      
      // Get color for this series and label
      const barColor = (series.barColors && series.barColors[labelIndex]) || 
                       (series.barColors && series.barColors[0]) || 
                       defaultColor;
      
      // Create a bar with rounded corners on the side away from x-axis
      // For positive bars: rounded top corners, sharp bottom (at x-axis)
      // For negative bars: rounded bottom corners, sharp top (at x-axis)
      const radius = Math.min(4, barHeight / 2); // Ensure radius doesn't exceed half the height
      const x = barX;
      const y = barY;
      const width = actualBarWidth;
      const height = barHeight;
      
      bars.push(
        <Shape
          key={`${labelIndex}-${seriesIndex}`}
          listening={true}
          onMouseEnter={(e) => {
            if (onBarHover) {
              const barCenterX = barX + actualBarWidth / 2;
              const barTopY = barY;
              onBarHover({
                x: barCenterX,
                y: barTopY,
                value: value,
                seriesName: series.name,
                label: labels[labelIndex]
              });
            }
            const stage = e.target.getStage();
            if (stage) {
              stage.container().style.cursor = 'pointer';
            }
          }}
          onMouseLeave={(e) => {
            if (onBarLeave) {
              onBarLeave();
            }
            const stage = e.target.getStage();
            if (stage) {
              stage.container().style.cursor = 'default';
            }
          }}
          sceneFunc={(context, shape) => {
            context.save();
            
            // Apply shadow for depth
            if (height > 5) { // Only apply shadow to bars with significant height
              applyShadow(context, 0, 2, 6, 'rgba(0, 0, 0, 0.2)');
            }
            
            context.beginPath();
            
            if (isNegative) {
              // Negative bar: rounded bottom corners, sharp top (at x-axis)
              context.moveTo(x, y);
              context.lineTo(x + width, y);
              context.lineTo(x + width, y + height - radius);
              context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
              context.lineTo(x + radius, y + height);
              context.quadraticCurveTo(x, y + height, x, y + height - radius);
              context.closePath();
            } else {
              // Positive bar: rounded top corners, sharp bottom (at x-axis)
              context.moveTo(x, y + height);
              context.lineTo(x + width, y + height);
              context.lineTo(x + width, y + radius);
              context.quadraticCurveTo(x + width, y, x + width - radius, y);
              context.lineTo(x + radius, y);
              context.quadraticCurveTo(x, y, x, y + radius);
              context.closePath();
            }
            
            // Create and apply gradient
            const gradient = createBarGradient(context, x, y, width, height, barColor, isNegative);
            context.fillStyle = gradient;
            context.fill();
            
            // Clear shadow before drawing stroke
            clearShadow(context);
            
            // Add subtle border for definition
            context.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            context.lineWidth = 0.5;
            context.stroke();
            
            context.restore();
            context.fillStrokeShape(shape);
          }}
          hitFunc={(context, shape) => {
            // Define hit area for mouse events - use same shape as visual
            context.beginPath();
            if (isNegative) {
              // Negative bar: rounded bottom corners
              context.moveTo(x, y);
              context.lineTo(x + width, y);
              context.lineTo(x + width, y + height - radius);
              context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
              context.lineTo(x + radius, y + height);
              context.quadraticCurveTo(x, y + height, x, y + height - radius);
              context.closePath();
            } else {
              // Positive bar: rounded top corners
              context.moveTo(x, y + height);
              context.lineTo(x + width, y + height);
              context.lineTo(x + width, y + radius);
              context.quadraticCurveTo(x + width, y, x + width - radius, y);
              context.lineTo(x + radius, y);
              context.quadraticCurveTo(x, y, x, y + radius);
              context.closePath();
            }
            context.fillStrokeShape(shape);
          }}
        />
      );
    });
  });
  
  return bars;
};

export default BarChart;

