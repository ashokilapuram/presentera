import React from 'react';
import { Group, Rect, Text, Shape } from 'react-konva';

/**
 * Renders series legend below X-axis labels inside chart container
 */
const ChartLegend = ({ 
  seriesData, 
  chartType, 
  chartW, 
  chartH, 
  padding,
  labels,
  xScale,
  labelsColor 
}) => {
  if (seriesData.length === 0 || chartType === 'pie') return null;
  
  const seriesColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
  
  // Calculate if labels need rotation
  const bandWidth = labels.length > 0 ? xScale.bandwidth() : 40;
  const minWidthForHorizontal = 40;
  const minWidthForRotation = 25;
  const needsLabelRotation = bandWidth < minWidthForRotation;
  const useTruncation = !needsLabelRotation && bandWidth < minWidthForHorizontal;
  
  const labelFontSize = 12;
  const estimateTextWidth = (text) => {
    return text.length * labelFontSize * 0.6;
  };
  
  const hasMultiLineLabels = labels.some(label => {
    if (needsLabelRotation || useTruncation) return false;
    const estimatedWidth = estimateTextWidth(label);
    return estimatedWidth > bandWidth;
  });
  
  const extraLabelSpace = needsLabelRotation ? 30 : (hasMultiLineLabels ? 20 : 0);
  
  // Position legend below X-axis labels, inside chart container
  const marginFromLabels = 20 + extraLabelSpace;
  const baseLabelY = chartH - padding + 8;
  const rotatedLabelY = baseLabelY + (needsLabelRotation ? 20 : 0);
  const baseLegendY = rotatedLabelY + marginFromLabels;
  
  // Calculate responsive layout
  const minItemWidth = 70;
  const itemContentWidth = 10 + 4 + minItemWidth;
  const availableWidth = chartW - (padding * 2);
  
  // Calculate how many items can fit in one row
  const minItemGap = 8;
  const maxItemGap = 16;
  const estimatedItemWidth = itemContentWidth + minItemGap;
  const maxItemsInRow = Math.max(1, Math.floor(availableWidth / estimatedItemWidth));
  const itemsPerRow = Math.min(seriesData.length, maxItemsInRow);
  const rows = Math.ceil(seriesData.length / itemsPerRow);
  const rowHeight = 14;
  
  // Calculate dynamic gap based on available width
  const calculateItemGap = (itemsInRow) => {
    if (itemsInRow <= 1) return 0;
    const totalItemsWidth = itemsInRow * itemContentWidth;
    const remainingSpace = availableWidth - totalItemsWidth;
    const gap = remainingSpace / (itemsInRow - 1);
    return Math.max(minItemGap, Math.min(maxItemGap, gap));
  };
  
  return seriesData.map((series, index) => {
    const seriesColor = (series.barColors && series.barColors[0]) || 
                       seriesColors[index % seriesColors.length];
    
    // Calculate row and column position
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    const legendY = baseLegendY + (row * rowHeight);
    
    // Calculate items in current row (last row might have fewer items)
    const itemsInCurrentRow = row === rows - 1 
      ? seriesData.length - (row * itemsPerRow) 
      : itemsPerRow;
    
    // Calculate dynamic gap for this row
    const itemGap = calculateItemGap(itemsInCurrentRow);
    
    // Calculate total width needed for items in this row
    const totalItemsWidth = itemsInCurrentRow * itemContentWidth;
    const totalGapsWidth = (itemsInCurrentRow - 1) * itemGap;
    const totalRowWidth = totalItemsWidth + totalGapsWidth;
    
    // Center the row within available width
    const rowStartX = padding + (availableWidth - totalRowWidth) / 2;
    
    // Calculate position of this item within the row
    const legendX = rowStartX + (col * (itemContentWidth + itemGap));
    
    return (
      <Group key={index} listening={false}>
        {/* Color indicator square */}
        <Rect
          x={legendX}
          y={legendY}
          width={10}
          height={10}
          fill={seriesColor}
          cornerRadius={2}
          listening={false}
        />
        {/* Series name with enhanced sharp rendering */}
        <Shape
          sceneFunc={(context, shape) => {
            const text = series.name || `Series ${index + 1}`;
            const x = legendX + 14;
            const y = legendY;
            const fontSize = 13;
            const textColor = labelsColor || "#1f2937"; // Darker, richer color
            
            context.save();
            
            // Enable better text rendering
            context.textAlign = 'left';
            context.textBaseline = 'top';
            context.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
            
            // Measure text and handle ellipsis
            let displayText = text;
            const maxWidth = minItemWidth;
            const textMetrics = context.measureText(text);
            if (textMetrics.width > maxWidth) {
              // Truncate with ellipsis
              let truncated = text;
              while (context.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
                truncated = truncated.slice(0, -1);
              }
              displayText = truncated + '...';
            }
            
            // Draw text with rich color
            context.fillStyle = textColor;
            context.fillText(displayText, x, y);
            
            context.restore();
            context.fillStrokeShape(shape);
          }}
          listening={false}
        />
      </Group>
    );
  });
};

/**
 * Calculates legend height for background wrapping
 */
export const calculateLegendHeight = (seriesData, chartType, chartW, chartH, padding, labels, xScale) => {
  if (seriesData.length === 0 || chartType === 'pie') return 0;
  
  const bandWidth = labels.length > 0 ? xScale.bandwidth() : 40;
  const minWidthForHorizontal = 40;
  const minWidthForRotation = 25;
  const needsLabelRotation = bandWidth < minWidthForRotation;
  const useTruncation = !needsLabelRotation && bandWidth < minWidthForHorizontal;
  
  const labelFontSize = 12;
  const estimateTextWidth = (text) => {
    return text.length * labelFontSize * 0.6;
  };
  
  const hasMultiLineLabels = labels.some(label => {
    if (needsLabelRotation || useTruncation) return false;
    const estimatedWidth = estimateTextWidth(label);
    return estimatedWidth > bandWidth;
  });
  
  const extraLabelSpace = needsLabelRotation ? 30 : (hasMultiLineLabels ? 20 : 0);
  
  const minItemWidth = 70;
  const itemContentWidth = 10 + 4 + minItemWidth;
  const availableWidth = chartW - (padding * 2);
  const minItemGap = 8;
  const estimatedItemWidth = itemContentWidth + minItemGap;
  const maxItemsInRow = Math.max(1, Math.floor(availableWidth / estimatedItemWidth));
  const itemsPerRow = Math.min(seriesData.length, maxItemsInRow);
  const rows = Math.ceil(seriesData.length / itemsPerRow);
  const rowHeight = 14;
  const marginFromLabels = 20 + extraLabelSpace;
  const marginBottom = 8;
  
  return (rows * rowHeight) + marginFromLabels + marginBottom;
};

export default ChartLegend;

