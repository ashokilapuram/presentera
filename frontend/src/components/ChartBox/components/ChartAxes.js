import React from 'react';
import { Line, Text, Shape } from 'react-konva';
import * as d3 from 'd3';

/**
 * Renders Y-axis labels with enhanced sharp text rendering
 */
export const YAxisValues = ({ 
  yScale, 
  hasNegativeValues, 
  minVal, 
  maxVal,
  yAxisColor 
}) => {
  const tickCount = 4;
  const domain = hasNegativeValues ? [minVal, maxVal] : [0, maxVal];
  const ticks = d3.ticks(domain[0], domain[1], tickCount);
  const textColor = yAxisColor || "#1f2937"; // Darker, richer color
  
  return ticks.map((t, i) => {
    const text = t.toFixed(0);
    const x = 4;
    const y = yScale(t) - 6;
    const fontSize = 13;
    
    return (
      <Shape
        key={i}
        listening={false}
        sceneFunc={(context, shape) => {
          context.save();
          
          // Enable better text rendering
          context.textAlign = 'left';
          context.textBaseline = 'top';
          context.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
          
          // Draw text with rich color
          context.fillStyle = textColor;
          context.fillText(text, x, y);
          
          context.restore();
          context.fillStrokeShape(shape);
        }}
      />
    );
  });
};

/**
 * Renders X-axis labels with rotation and truncation support
 */
export const XAxisLabels = ({ 
  labels, 
  xScale, 
  chartH, 
  padding,
  labelsColor 
}) => {
  if (!labels || labels.length === 0) return null;
  
  // Calculate if labels need rotation (for legend positioning)
  const bandWidth = labels.length > 0 ? xScale.bandwidth() : 40;
  const minWidthForHorizontal = 40; // Minimum width needed for horizontal labels
  const minWidthForRotation = 25; // Below this, rotate labels
  const needsLabelRotation = bandWidth < minWidthForRotation;
  const useTruncation = !needsLabelRotation && bandWidth < minWidthForHorizontal;
  
  // Estimate if labels will wrap to multiple lines
  const labelFontSize = 14;
  const estimateTextWidth = (text) => {
    // Rough estimate: average character width is about 0.6 * fontSize for most fonts
    return text.length * labelFontSize * 0.6;
  };
  
  const hasMultiLineLabels = labels.some(label => {
    if (needsLabelRotation || useTruncation) return false; // Rotated or truncated labels don't wrap
    const estimatedWidth = estimateTextWidth(label);
    return estimatedWidth > bandWidth;
  });
  
  // Calculate label Y position - adjust if rotated or multi-line to avoid overlap
  const baseLabelY = chartH - padding + 8;
  const rotatedLabelY = baseLabelY + (needsLabelRotation ? 20 : 0); // Extra space for rotated labels
  const multiLineLabelY = rotatedLabelY + (hasMultiLineLabels && !needsLabelRotation ? 0 : 0); // Keep same Y, but allow wrapping
  
  const textColor = labelsColor || "#1f2937"; // Darker, richer color
  
  return labels.map((label, i) => {
    // Center label perfectly under the bar band
    const labelX = xScale(label) + xScale.bandwidth() / 2;
    let displayText = label;
    
    // Truncate text if needed (but don't truncate if we want to allow wrapping)
    if (useTruncation && label.length > 0 && !hasMultiLineLabels) {
      const maxChars = Math.floor(bandWidth / 6); // Rough estimate: 6px per character
      if (label.length > maxChars && maxChars > 3) {
        displayText = label.substring(0, maxChars - 3) + '...';
      }
    }
    
    const rotation = needsLabelRotation ? -90 : 0;
    const offsetY = needsLabelRotation ? labelFontSize / 2 : 0;
    
    return (
      <Shape
        key={i}
        listening={false}
        sceneFunc={(context, shape) => {
          context.save();
          
          // Translate to center point for rotation
          context.translate(labelX, multiLineLabelY);
          if (needsLabelRotation) {
            context.rotate((rotation * Math.PI) / 180);
          }
          
          // Enable better text rendering
          context.textAlign = needsLabelRotation ? 'center' : 'center';
          context.textBaseline = needsLabelRotation ? 'middle' : 'top';
          context.font = `bold ${labelFontSize}px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
          
          // Handle text wrapping
          const lines = hasMultiLineLabels && !needsLabelRotation
            ? wrapText(context, displayText, bandWidth)
            : [displayText];
          
          const lineHeight = labelFontSize * 1.2;
          const startY = needsLabelRotation ? 0 : (offsetY || 0);
          
          lines.forEach((line, lineIndex) => {
            const y = startY + (lineIndex * lineHeight);
            
            // Draw text with rich color
            context.fillStyle = textColor;
            context.fillText(line, 0, y);
          });
          
          context.restore();
          context.fillStrokeShape(shape);
        }}
      />
    );
  });
  
  // Helper function to wrap text
  function wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = context.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth && currentLine.length < 50) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
};

/**
 * Renders axis lines (X and Y)
 */
export const AxisLines = ({ 
  chartType, 
  showXAxis, 
  showYAxis, 
  chartW, 
  chartH, 
  padding, 
  yScale,
  hasNegativeValues 
}) => {
  // Use lighter axis lines for line charts for a more professional look
  const isLineChart = chartType === "line";
  const axisColor = isLineChart ? "#e5e7eb" : "#9ca3af";
  const axisWidth = isLineChart ? 1.5 : 2;
  
  return (
    <>
      {/* Zero line for negative values */}
      {hasNegativeValues && chartType !== "pie" && (
        <Line
          points={[padding, yScale(0), chartW - padding, yScale(0)]}
          stroke="#d1d5db"
          strokeWidth={1}
          dash={[2, 2]}
          listening={false}
        />
      )}

      {/* X-Axis Line */}
      {showXAxis && chartType !== "pie" && (
        <Line
          points={[padding, yScale(0), chartW - padding, yScale(0)]}
          stroke={axisColor}
          strokeWidth={axisWidth}
          listening={false}
        />
      )}

      {/* Y-Axis Line */}
      {showYAxis && chartType !== "pie" && (
        <Line
          points={[padding, padding, padding, chartH - padding]}
          stroke={axisColor}
          strokeWidth={axisWidth}
          listening={false}
        />
      )}
    </>
  );
};

