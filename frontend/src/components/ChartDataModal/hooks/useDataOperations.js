import { useCallback } from 'react';
import { getColorForNewRow, getColorForNewSeries, padChartData, SERIES_COLORS, DEFAULT_COLORS } from '../utils/dataProcessing';

/**
 * Custom hook to handle data operations (add/remove rows, add/remove series, etc.)
 */
export const useDataOperations = (element, labels, series, setLabels, setSeries) => {
  const handleLabelChange = useCallback((index, value) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
  }, [labels, setLabels]);

  const handleSeriesNameChange = useCallback((seriesIndex, value) => {
    const newSeries = [...series];
    newSeries[seriesIndex] = { ...newSeries[seriesIndex], name: value };
    setSeries(newSeries);
  }, [series, setSeries]);

  const handleValueChange = useCallback((seriesIndex, rowIndex, value) => {
    // Allow empty string, convert to 0 only when it's actually empty and we're processing
    let finalValue;
    if (value === '' || value === null || value === undefined) {
      // Keep as 0 for now, but allow empty string in display
      finalValue = 0;
    } else {
      const num = Number(value);
      finalValue = isNaN(num) ? 0 : (element.chartType === 'pie' || element.chartType === 'line' ? Math.max(0, num) : num);
    }
    const newSeries = [...series];
    const newValues = [...newSeries[seriesIndex].values];
    newValues[rowIndex] = finalValue;
    newSeries[seriesIndex] = { ...newSeries[seriesIndex], values: newValues };
    setSeries(newSeries);
  }, [series, setSeries, element.chartType]);

  const addRow = useCallback(() => {
    const newLabels = [...labels, `Item ${labels.length + 1}`];
    setLabels(newLabels);
    
    const newSeries = series.map(s => {
      const newValues = [...s.values, 0];
      let newBarColors = [...s.barColors];
      const color = getColorForNewRow(s, element.chartType, element);
      newBarColors.push(color);
      
      return { ...s, values: newValues, barColors: newBarColors };
    });
    
    setSeries(newSeries);
  }, [labels, series, element, setLabels, setSeries]);

  const removeRow = useCallback((index) => {
    setLabels(labels.filter((_, i) => i !== index));
    const newSeries = series.map(s => ({
      ...s,
      values: s.values.filter((_, i) => i !== index),
      barColors: s.barColors.filter((_, i) => i !== index)
    }));
    setSeries(newSeries);
  }, [labels, series, setLabels, setSeries]);

  const addSeries = useCallback(() => {
    const newSeriesIndex = series.length;
    const seriesColor = getColorForNewSeries(series, element.chartType, newSeriesIndex, labels);
    
    const newSeries = {
      name: `Series ${series.length + 1}`,
      values: labels.map(() => 0),
      barColors: Array.isArray(seriesColor) ? seriesColor : labels.map(() => seriesColor)
    };
    
    setSeries([...series, newSeries]);
  }, [series, labels, element.chartType, setSeries]);

  const removeSeries = useCallback((seriesIndex) => {
    if (series.length > 1) {
      setSeries(series.filter((_, i) => i !== seriesIndex));
    }
  }, [series, setSeries]);

  const handleSave = useCallback((onSave, onClose) => {
    const finalData = padChartData(labels, series, element.chartType, element);
    onSave(finalData, { isLive: false });
    onClose();
  }, [labels, series, element]);

  const handleKeyDown = useCallback((e, rowIndex, colIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to next cell or add row
      if (colIndex === 0) {
        // From label, move to first series value
        const nextInput = e.target.parentElement.parentElement.querySelector('input[data-col="1"]');
        if (nextInput) nextInput.focus();
      } else if (colIndex < series.length) {
        // From a series value, move to next series or next row
        if (colIndex < series.length) {
          const nextInput = e.target.parentElement.parentElement.querySelector(`input[data-col="${colIndex + 1}"]`);
          if (nextInput) {
            nextInput.focus();
          } else if (rowIndex === labels.length - 1) {
            // Last row, add new row
            addRow();
            setTimeout(() => {
              const nextRow = e.target.closest('tr').nextElementSibling;
              if (nextRow) {
                const firstInput = nextRow.querySelector('input[data-col="1"]');
                if (firstInput) firstInput.focus();
              }
            }, 0);
          } else {
            // Move to next row
            const nextRow = e.target.closest('tr').nextElementSibling;
            if (nextRow) {
              const firstInput = nextRow.querySelector('input[data-col="1"]');
              if (firstInput) firstInput.focus();
            }
          }
        }
      } else if (rowIndex === labels.length - 1) {
        // Last row, add new row
        addRow();
        setTimeout(() => {
          const nextRow = e.target.closest('tr').nextElementSibling;
          if (nextRow) {
            const firstInput = nextRow.querySelector('input');
            if (firstInput) firstInput.focus();
          }
        }, 0);
      } else {
        // Move to next row
        const nextRow = e.target.closest('tr').nextElementSibling;
        if (nextRow) {
          const firstInput = nextRow.querySelector('input[data-col="1"]');
          if (firstInput) firstInput.focus();
        }
      }
    } else if (e.key === 'Tab' && e.shiftKey === false && colIndex === series.length && rowIndex === labels.length - 1) {
      // Tab on last cell of last row - add new row
      e.preventDefault();
      addRow();
      setTimeout(() => {
        const nextRow = e.target.closest('tr').nextElementSibling;
        if (nextRow) {
          const firstInput = nextRow.querySelector('input[data-col="1"]');
          if (firstInput) firstInput.focus();
        }
      }, 0);
    }
  }, [series, labels, addRow]);

  return {
    handleLabelChange,
    handleSeriesNameChange,
    handleValueChange,
    addRow,
    removeRow,
    addSeries,
    removeSeries,
    handleSave,
    handleKeyDown
  };
};

