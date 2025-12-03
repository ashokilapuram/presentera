/**
 * Utility functions for chart options
 */

export const DEFAULT_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];

/**
 * Gets the bar color for a specific index based on chart type
 */
export const getBarColor = (selectedElement, index) => {
  if (selectedElement.barColors && selectedElement.barColors[index]) {
    return selectedElement.barColors[index];
  }
  // Use correct defaults based on chart type
  if (selectedElement.chartType === 'line') {
    return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  } else if (selectedElement.chartType === 'bar') {
    return selectedElement.color || '#0ea5e9';
  } else {
    // pie chart
    return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  }
};

/**
 * Handles bar color change
 */
export const handleBarColorChange = (selectedElement, updateSlideElement, index, color) => {
  const newBarColors = [...(selectedElement.barColors || [])];
  // Ensure the array is the right size
  while (newBarColors.length < (selectedElement.labels || []).length) {
    if (selectedElement.chartType === 'pie' || selectedElement.chartType === 'line') {
      newBarColors.push(DEFAULT_COLORS[newBarColors.length % DEFAULT_COLORS.length]);
    } else {
      newBarColors.push(selectedElement.color || '#0ea5e9');
    }
  }
  newBarColors[index] = color;
  const updates = { barColors: newBarColors };
  // For pie charts, clear series array to ensure values are used directly
  if (selectedElement.chartType === 'pie') {
    updates.series = undefined;
  }
  updateSlideElement(selectedElement.id, updates);
};

/**
 * Removes a data point
 */
export const removeDataPoint = (selectedElement, updateSlideElement, index) => {
  const newLabels = [...(selectedElement.labels || [])];
  const newValues = [...(selectedElement.values || [])];
  const newBarColors = [...(selectedElement.barColors || [])];
  newLabels.splice(index, 1);
  newValues.splice(index, 1);
  newBarColors.splice(index, 1);
  const updates = { labels: newLabels, values: newValues, barColors: newBarColors };
  // For pie charts, clear series array to ensure values are used directly
  if (selectedElement.chartType === 'pie') {
    updates.series = undefined;
  }
  updateSlideElement(selectedElement.id, updates);
};

/**
 * Adds a new data point
 */
export const addDataPoint = (selectedElement, updateSlideElement) => {
  const newLabels = [...(selectedElement.labels || []), `Item ${(selectedElement.labels?.length || 0) + 1}`];
  const newValues = [...(selectedElement.values || []), 0];
  
  // Also update barColors to match what ChartBox will generate
  const currentBarColors = selectedElement.barColors || [];
  const newBarColors = [...currentBarColors];
  const newIndex = newLabels.length - 1;
  
  // Determine the color for the new item based on chart type (matching ChartBox logic)
  if (selectedElement.chartType === 'line') {
    // For line charts, use diverse colors
    newBarColors.push(DEFAULT_COLORS[newIndex % DEFAULT_COLORS.length]);
  } else if (selectedElement.chartType === 'bar') {
    // For bar charts, use the single default color
    newBarColors.push(selectedElement.color || '#0ea5e9');
  } else {
    // For pie charts, use diverse colors
    newBarColors.push(DEFAULT_COLORS[newIndex % DEFAULT_COLORS.length]);
  }
  
  const updates = { labels: newLabels, values: newValues, barColors: newBarColors };
  // For pie charts, clear series array to ensure values are used directly
  if (selectedElement.chartType === 'pie') {
    updates.series = undefined;
  }
  updateSlideElement(selectedElement.id, updates);
};

