/**
 * Utility functions for processing chart data
 */

export const DEFAULT_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];
export const SERIES_COLORS = ['#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316', '#0ea5e9', '#10b981'];

/**
 * Converts old format element data to new series format
 */
export const convertElementToSeries = (element) => {
  const labelsData = element.labels || [];
  let seriesData = [];
  
  if (element.series && Array.isArray(element.series)) {
    // New format: use series array
    seriesData = element.series.map(s => ({
      name: s.name || 'Series',
      values: s.values || [],
      barColors: s.barColors || []
    }));
  } else {
    // Old format: convert to series array
    const values1Data = element.values || [];
    const barColors1Data = element.barColors || [];
    
    // Series 1
    seriesData.push({
      name: element.dataset1Name || 'Series 1',
      values: values1Data,
      barColors: barColors1Data.length > 0 ? barColors1Data : 
        (element.chartType === 'line' 
          ? labelsData.map((_, i) => DEFAULT_COLORS[i % DEFAULT_COLORS.length])
          : labelsData.map(() => element.color || '#0ea5e9'))
    });
    
    // Series 2 (if exists for bar/line charts)
    if ((element.chartType === 'bar' || element.chartType === 'line') && element.values2) {
      const values2Data = element.values2 || [];
      const barColors2Data = element.barColors2 || [];
      const dataset2Colors = ['#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316', '#0ea5e9', '#10b981'];
      
      seriesData.push({
        name: element.dataset2Name || 'Series 2',
        values: values2Data,
        barColors: barColors2Data.length > 0 ? barColors2Data :
          (element.chartType === 'line'
            ? labelsData.map((_, i) => dataset2Colors[i % dataset2Colors.length])
            : labelsData.map(() => element.color2 || '#8b5cf6'))
      });
    }
  }
  
  // Ensure at least one series exists
  if (seriesData.length === 0) {
    seriesData.push({
      name: 'Series 1',
      values: labelsData.map(() => 0),
      barColors: element.chartType === 'line'
        ? labelsData.map((_, i) => DEFAULT_COLORS[i % DEFAULT_COLORS.length])
        : labelsData.map(() => element.color || '#0ea5e9')
    });
  }
  
  return { labels: labelsData, series: seriesData };
};

/**
 * Pads data to ensure all series have the same length
 */
export const padChartData = (labels, series, chartType, element) => {
  const maxLength = Math.max(labels.length, ...series.map(s => s.values.length));
  
  // Pad labels
  let finalLabels = [...labels];
  while (finalLabels.length < maxLength) {
    finalLabels.push(`Item ${finalLabels.length + 1}`);
  }
  
  // Pad series
  const finalSeries = series.map((s, seriesIndex) => {
    let finalValues = [...s.values];
    let finalBarColors = [...s.barColors];
    
    while (finalValues.length < maxLength) {
      finalValues.push(0);
    }
    
    while (finalBarColors.length < maxLength) {
      if (chartType === 'line') {
        // For line charts, preserve existing colors - use the last color if available
        if (finalBarColors.length > 0) {
          finalBarColors.push(finalBarColors[finalBarColors.length - 1]);
        } else {
          finalBarColors.push(DEFAULT_COLORS[finalBarColors.length % DEFAULT_COLORS.length]);
        }
      } else if (chartType === 'bar') {
        // For bar charts, use the existing series color (first barColor)
        const seriesColor = finalBarColors.length > 0 ? finalBarColors[0] : SERIES_COLORS[seriesIndex % SERIES_COLORS.length];
        finalBarColors.push(seriesColor);
      } else {
        // For pie charts, preserve existing color pattern
        if (finalBarColors.length > 0) {
          finalBarColors.push(finalBarColors[finalBarColors.length - 1]);
        } else {
          finalBarColors.push(DEFAULT_COLORS[finalBarColors.length % DEFAULT_COLORS.length]);
        }
      }
    }
    
    return {
      name: s.name,
      values: finalValues,
      barColors: finalBarColors
    };
  });
  
  return { labels: finalLabels, series: finalSeries };
};

/**
 * Gets color for new row based on chart type
 */
export const getColorForNewRow = (series, chartType, element) => {
  if (chartType === 'line') {
    // For line charts, preserve existing colors - use the last color if available, otherwise cycle through
    if (series.barColors.length > 0) {
      return series.barColors[series.barColors.length - 1];
    } else {
      return DEFAULT_COLORS[0];
    }
  } else if (chartType === 'bar') {
    // For bar charts, use the existing series color (first barColor in the array)
    return series.barColors.length > 0 ? series.barColors[0] : (element.color || '#0ea5e9');
  } else {
    // For pie charts, preserve existing color pattern
    if (series.barColors.length > 0) {
      return series.barColors[series.barColors.length - 1];
    } else {
      return DEFAULT_COLORS[series.barColors.length % DEFAULT_COLORS.length];
    }
  }
};

/**
 * Gets color for new series
 */
export const getColorForNewSeries = (allSeries, chartType, seriesIndex, labels) => {
  if (chartType === 'bar' && allSeries.length > 0) {
    // Get the color from the last series to maintain color continuity
    const lastSeriesColor = allSeries[allSeries.length - 1].barColors[0];
    // Find next color in the SERIES_COLORS array that's different
    const colorIndex = SERIES_COLORS.findIndex(c => c === lastSeriesColor);
    return colorIndex >= 0 && colorIndex < SERIES_COLORS.length - 1 
      ? SERIES_COLORS[colorIndex + 1] 
      : SERIES_COLORS[seriesIndex % SERIES_COLORS.length];
  } else if (chartType === 'line') {
    // For line charts, use existing colors from previous series if available
    if (allSeries.length > 0 && allSeries[0].barColors.length > 0) {
      return labels.map((_, i) => {
        if (allSeries[0].barColors.length > i) {
          return allSeries[0].barColors[i];
        }
        return DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      });
    }
    return labels.map((_, i) => DEFAULT_COLORS[i % DEFAULT_COLORS.length]);
  } else {
    return SERIES_COLORS[seriesIndex % SERIES_COLORS.length];
  }
};

