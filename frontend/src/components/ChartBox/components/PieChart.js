import React from 'react';
import { Group, Circle, Text, Shape } from 'react-konva';
import * as d3 from 'd3';
// PathLike not required for flat slices with gradient

/**
 * Renders pie chart with enhanced text rendering
 */
const PieChart = ({ 
  data, 
  labels, 
  chartW, 
  chartH, 
  animationProgress, 
  sliceColors,
  element,
  titleSpacing = 0
}) => {
  // Account for title space at top and padding around edges
  // Reserve space for title at top, and ensure good padding on all sides
  const topPadding = titleSpacing || 0;
  const sidePadding = 15; // Good padding from sides for transformer
  const bottomPadding = 10; // Padding from bottom
  const availableWidth = chartW - (sidePadding * 2);
  const availableHeight = chartH - topPadding - bottomPadding;
  
  // Calculate radius based on available space, ensuring it doesn't overflow
  const radius = Math.min(availableWidth, availableHeight) / 2 - 5; // Extra 5px for safety
  
  const pieGen = d3.pie()(data);
  const arcGen = d3.arc().innerRadius(0).outerRadius(radius);
  const cx = chartW / 2;
  // Center Y should account for title space at top
  const cy = topPadding + (availableHeight / 2);
  const textColor = element.labelsColor || "#1f2937"; // Darker, richer color
  
  return pieGen.map((slice, i) => {
    const endAngle = slice.endAngle * animationProgress;
    const animPath = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius)
      .startAngle(slice.startAngle)
      .endAngle(endAngle)();

    // 3D depth parameters
    const depthSteps = 6; // number of stacked slices to fake depth
    const maxDepthOffset = Math.max(6, Math.min(12, Math.floor(radius / 30))); // px offset for bottom-most layer
    const depthOffset = maxDepthOffset * animationProgress; // animate depth with progress

    // Calculate responsive label position - on the left side of the chart
    const labelX = 8; // Closer to edge for smaller containers
    const labelSpacing = Math.max(20, Math.min(30, chartH / 8)); // Responsive spacing
    // Label Y should start after title space
    const labelY = Math.max(topPadding + 15, 35) + (i * labelSpacing); // Responsive vertical spacing
    const dotRadius = Math.max(4, Math.min(6, chartW / 60)); // Responsive dot size
    const fontSize = Math.max(8, Math.min(12, chartW / 40)); // More responsive font size
    
    // Calculate proper spacing between dot and text
    const dotCenterX = labelX + dotRadius;
    const textStartX = dotCenterX + dotRadius + 6; // 6px gap between dot and text

    // base color and d3 color helper
    const baseColor = sliceColors[i];
    const colorObj = d3.color(baseColor) || d3.color('#888');

    return (
      <Group key={i}>
        {/* Top slice with gradient shading and a thin white separator stroke */}
        <Shape
          sceneFunc={(context, shape) => {
            const path = new Path2D(animPath);

            try {
              // vertical-ish gradient to simulate light from top
              const g = context.createLinearGradient(0, -radius * 0.6, 0, radius * 0.6);
              const light = (d3.color(baseColor) || d3.color('#ffffff')).brighter(0.9).formatRgb();
              const mid = baseColor;
              const dark = (d3.color(baseColor) || d3.color('#000')).darker(0.8).formatRgb();
              g.addColorStop(0, light);
              g.addColorStop(0.6, mid);
              g.addColorStop(1, dark);

              context.save();
              // subtle lift shadow
              context.shadowColor = 'rgba(0,0,0,0.12)';
              context.shadowBlur = 4 * animationProgress;
              context.shadowOffsetY = 1 * animationProgress;

              context.fillStyle = g;
              context.fill(path);
              context.restore();
            } catch (err) {
              context.fillStyle = baseColor;
              context.fill(path);
            }

            // finish drawing the slice (no separator stroke)
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          x={cx}
          y={cy}
        />

        {/* Color indicator dot */}
        <Circle
          x={dotCenterX}
          y={labelY}
          radius={dotRadius}
          fill={sliceColors[i]}
          listening={false}
        />

        {/* Pie slice labels with enhanced sharp rendering */}
        <Shape
          sceneFunc={(context, shape) => {
            const text = labels[i];
            const x = textStartX;
            const y = labelY;

            context.save();

            // Enable better text rendering
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            context.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

            // Draw text with rich color
            context.fillStyle = textColor;
            context.fillText(text, x, y);

            context.restore();
            context.fillStrokeShape(shape);
          }}
          listening={false}
        />
      </Group>
    );
  });
};

export default PieChart;

