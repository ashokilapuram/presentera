import React from 'react';
import { Group, Rect, Text } from 'react-konva';

/**
 * Tooltip component for showing values on hover
 */
const ChartTooltip = ({ x, y, value, seriesName, visible }) => {
  if (!visible || value === undefined || value === null) return null;

  const padding = 8;
  const fontSize = 12;
  const lineHeight = 16;
  
  // Format the value
  const formattedValue = typeof value === 'number' 
    ? value.toFixed(1) === Math.round(value).toFixed(1) 
      ? value.toString() 
      : value.toFixed(1)
    : value.toString();
  
  // Calculate text dimensions
  const textLines = seriesName ? [seriesName, formattedValue] : [formattedValue];
  const maxTextWidth = Math.max(...textLines.map(line => line.length * fontSize * 0.6));
  const tooltipWidth = maxTextWidth + (padding * 2);
  const tooltipHeight = (textLines.length * lineHeight) + (padding * 2);
  
  // Position tooltip above the point, centered horizontally
  const tooltipX = x - tooltipWidth / 2;
  const tooltipY = y - tooltipHeight - 10; // 10px above the point
  
  return (
    <Group x={tooltipX} y={tooltipY}>
      {/* Background */}
      <Rect
        width={tooltipWidth}
        height={tooltipHeight}
        fill="rgba(0, 0, 0, 0.85)"
        cornerRadius={6}
        shadowBlur={8}
        shadowColor="rgba(0, 0, 0, 0.3)"
        shadowOffset={{ x: 0, y: 2 }}
      />
      
      {/* Text */}
      {textLines.map((line, index) => (
        <Text
          key={index}
          text={line}
          x={padding}
          y={padding + (index * lineHeight)}
          fontSize={fontSize}
          fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fill="#ffffff"
          fontStyle={index === 0 && seriesName ? "bold" : "normal"}
        />
      ))}
    </Group>
  );
};

export default ChartTooltip;

