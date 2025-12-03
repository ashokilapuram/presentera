import { useMemo } from 'react';
import * as d3 from 'd3';

/**
 * Processes chart data and returns series data, scales, and color information
 */
export const useChartDataProcessor = (element, chartW, chartH, padding) => {
  // Support new series format or old format
  // For pie charts, always use element.values directly (ignore series array)
  const seriesData = useMemo(() => {
    let data = [];
    if (element.chartType === 'pie') {
      // Pie charts always use element.values directly
      const values = element.values || [];
      const labels = element.labels || [];
      const barColors = element.barColors || [];
      const defaultColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
      
      data.push({
        name: 'Series 1',
        values: values,
        barColors: barColors.length > 0 ? barColors : 
          labels.map((_, i) => defaultColors[i % defaultColors.length])
      });
    } else if (element.series && Array.isArray(element.series)) {
      // New format: series array (for bar and line charts)
      data = element.series;
    } else {
      // Old format: convert to series array for backward compatibility
      const values = element.values || [];
      const labels = element.labels || [];
      const barColors = element.barColors || [];
      const defaultColor = element.color || "#0ea5e9";
      const defaultColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
      
      data.push({
        name: element.dataset1Name || 'Series 1',
        values: values,
        barColors: barColors.length > 0 ? barColors : 
          (element.chartType === 'line' 
            ? labels.map((_, i) => defaultColors[i % defaultColors.length])
            : labels.map(() => defaultColor))
      });
      
      // Add second series if exists
      if ((element.chartType === 'bar' || element.chartType === 'line') && element.values2) {
        const values2 = element.values2 || [];
        const barColors2 = element.barColors2 || [];
        const dataset2Colors = ['#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316', '#0ea5e9', '#10b981'];
        const color2 = element.color2 || '#8b5cf6';
        
        data.push({
          name: element.dataset2Name || 'Series 2',
          values: values2,
          barColors: barColors2.length > 0 ? barColors2 :
            (element.chartType === 'line'
              ? labels.map((_, i) => dataset2Colors[i % dataset2Colors.length])
              : labels.map(() => color2))
        });
      }
    }
    return data;
  }, [element.series, element.values, element.values2, element.chartType, element.labels, element.barColors, element.barColors2, element.color, element.color2, element.dataset1Name, element.dataset2Name]);

  // Calculate max/min values across all series
  const { maxVal, minVal, hasNegativeValues } = useMemo(() => {
    let allValues = [];
    seriesData.forEach(s => {
      allValues = [...allValues, ...(s.values || [])];
    });
    const max = d3.max(allValues) || 1;
    const min = d3.min(allValues) || 0;
    return {
      maxVal: max,
      minVal: min,
      hasNegativeValues: min < 0
    };
  }, [seriesData]);

  // For backward compatibility, use first series as primary data
  const data = seriesData.length > 0 ? seriesData[0].values : [];
  const labels = element.labels || [];

  // Scales
  const xScale = d3
    .scaleBand()
    .domain(labels)
    .range([padding, chartW - padding])
    .padding(0.25);
  
  // Y-axis scale that handles negative values
  const yScale = d3
    .scaleLinear()
    .domain(hasNegativeValues ? [minVal, maxVal] : [0, maxVal])
    .range(hasNegativeValues ? [chartH - padding, padding] : [chartH - padding, padding]);

  // Colors
  const defaultColor = element.color || "#0ea5e9";
  
  // Memoize barColors to ensure proper updates when colors change
  const barColors = useMemo(() => {
    // Always ensure we have a valid array
    if (!labels || labels.length === 0) {
      return [];
    }
    
    if (element.barColors && element.barColors.length === labels.length) {
      return element.barColors;
    }
    if (element.barColors && element.barColors.length > 0) {
      // Preserve existing colors and only extend if needed
      const colors = [...element.barColors];
      while (colors.length < labels.length) {
        // For line charts, use diverse colors; for bar charts, use single default color
        if (element.chartType === 'line') {
          const defaultColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
          colors.push(defaultColors[colors.length % defaultColors.length]);
        } else {
          colors.push(defaultColor);
        }
      }
      return colors;
    }
    // Create new array with default colors
    if (element.chartType === 'line') {
      // For line charts, use diverse colors for each point
      const defaultColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
      return labels.map((_, i) => defaultColors[i % defaultColors.length]);
    }
    return labels.map(() => defaultColor);
  }, [element.barColors, labels.length, defaultColor, element.chartType]);
  
  // Use barColors for pie slices to unify color management
  const sliceColors = useMemo(() => {
    if (element.barColors && element.barColors.length === labels.length) {
      return element.barColors;
    }
    if (element.barColors && element.barColors.length > 0) {
      // Preserve existing colors and only extend if needed
      const defaultColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
      const colors = [...element.barColors];
      // Only extend if we have fewer colors than labels
      while (colors.length < labels.length) {
        colors.push(defaultColors[colors.length % defaultColors.length]);
      }
      return colors;
    }
    // Create new array with different colors for each slice
    const defaultColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
    return labels.map((_, i) => defaultColors[i % defaultColors.length]);
  }, [element.barColors, labels.length]);

  return {
    seriesData,
    data,
    labels,
    maxVal,
    minVal,
    hasNegativeValues,
    xScale,
    yScale,
    defaultColor,
    barColors,
    sliceColors
  };
};

