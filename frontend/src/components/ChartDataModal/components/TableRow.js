import React, { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

/**
 * Table row component for chart data input
 */
const TableRow = ({ 
  label, 
  rowIndex, 
  series, 
  chartType,
  onLabelChange, 
  onValueChange, 
  onRemoveRow, 
  onKeyDown 
}) => {
  // Track display values for number inputs to allow empty strings
  const [displayValues, setDisplayValues] = useState({});
  // Track which inputs are currently focused to prevent overwriting user input
  const focusedInputs = useRef(new Set());
  // Track previous series values to detect external changes
  const prevSeriesRef = useRef(series);
  // Track if component has mounted
  const isMountedRef = useRef(false);

  // Initialize display values on mount
  useEffect(() => {
    if (!isMountedRef.current) {
      const initialDisplayValues = {};
      series.forEach((s, seriesIndex) => {
        const key = `${seriesIndex}-${rowIndex}`;
        const value = s.values[rowIndex];
        if (value === 0 || value === undefined || value === null) {
          initialDisplayValues[key] = '';
        } else {
          initialDisplayValues[key] = value.toString();
        }
      });
      setDisplayValues(initialDisplayValues);
      prevSeriesRef.current = series;
      isMountedRef.current = true;
    }
  }, []);

  // Update display values when series data changes (but not if user is editing)
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // Check if series actually changed from outside (not from our own updates)
    const seriesChanged = JSON.stringify(prevSeriesRef.current) !== JSON.stringify(series);
    
    if (seriesChanged) {
      const newDisplayValues = {};
      series.forEach((s, seriesIndex) => {
        const key = `${seriesIndex}-${rowIndex}`;
        // Only update if this input is not currently focused
        if (!focusedInputs.current.has(key)) {
          const value = s.values[rowIndex];
          if (value === 0 || value === undefined || value === null) {
            newDisplayValues[key] = '';
          } else {
            newDisplayValues[key] = value.toString();
          }
        }
      });
      setDisplayValues(prev => ({ ...prev, ...newDisplayValues }));
      prevSeriesRef.current = series;
    }
  }, [series, rowIndex]);

  const handleValueChange = (seriesIndex, value) => {
    const key = `${seriesIndex}-${rowIndex}`;
    setDisplayValues(prev => ({ ...prev, [key]: value }));
    // Only update the actual value if it's not empty
    if (value !== '' && value !== null && value !== undefined) {
      onValueChange(seriesIndex, rowIndex, value);
    }
  };

  const handleValueFocus = (seriesIndex) => {
    const key = `${seriesIndex}-${rowIndex}`;
    focusedInputs.current.add(key);
  };

  const handleValueBlur = (seriesIndex) => {
    const key = `${seriesIndex}-${rowIndex}`;
    focusedInputs.current.delete(key);
    const displayValue = displayValues[key];
    // Convert empty string to 0 on blur
    if (displayValue === '' || displayValue === undefined || displayValue === null) {
      onValueChange(seriesIndex, rowIndex, '0');
      setDisplayValues(prev => ({ ...prev, [key]: '' }));
    }
  };

  return (
    <tr>
      <td className="table-cell">
        <input
          type="text"
          value={label}
          onChange={(e) => onLabelChange(rowIndex, e.target.value)}
          className="table-input"
          data-col="0"
          onKeyDown={(e) => onKeyDown(e, rowIndex, 0)}
        />
      </td>
      {series.map((s, seriesIndex) => {
        const key = `${seriesIndex}-${rowIndex}`;
        const displayValue = displayValues[key] !== undefined 
          ? displayValues[key] 
          : (s.values[rowIndex] === 0 || s.values[rowIndex] === undefined || s.values[rowIndex] === null ? '' : s.values[rowIndex].toString());
        
        return (
          <td key={seriesIndex} className="table-cell">
            <input
              type="number"
              value={displayValue}
              onChange={(e) => handleValueChange(seriesIndex, e.target.value)}
              onFocus={() => handleValueFocus(seriesIndex)}
              onBlur={() => handleValueBlur(seriesIndex)}
              className="table-input"
              data-col={seriesIndex + 1}
              min={chartType === 'bar' ? undefined : "0"}
              onKeyDown={(e) => onKeyDown(e, rowIndex, seriesIndex + 1)}
            />
          </td>
        );
      })}
      <td className="table-cell actions-cell">
        <button
          onClick={() => onRemoveRow(rowIndex)}
          className="remove-row-button"
          title="Remove row"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
};

export default TableRow;

