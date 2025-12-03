import React, { useState, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import ModernColorPicker from '../../shared/ModernColorPicker';

/**
 * Component for pie chart data points editing
 */
const PieChartDataPoints = ({ 
  selectedElement, 
  updateSlideElement,
  getBarColor,
  handleBarColorChange,
  removeDataPoint,
  addDataPoint
}) => {
  // Track display values for number inputs to allow empty strings
  const [displayValues, setDisplayValues] = useState({});
  // Track which inputs are currently focused to prevent overwriting user input
  const focusedInputs = useRef(new Set());
  // Track previous values to detect external changes
  const prevValuesRef = useRef(selectedElement.values);
  // Track if component has mounted
  const isMountedRef = useRef(false);

  // Initialize display values on mount
  useEffect(() => {
    if (!isMountedRef.current) {
      const currentValues = selectedElement.values || [];
      const initialDisplayValues = {};
      currentValues.forEach((value, index) => {
        if (value === 0 || value === undefined || value === null) {
          initialDisplayValues[index] = '';
        } else {
          initialDisplayValues[index] = value.toString();
        }
      });
      setDisplayValues(initialDisplayValues);
      prevValuesRef.current = currentValues;
      isMountedRef.current = true;
    }
  }, []);

  // Update display values when selectedElement changes (but not if user is editing)
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const currentValues = selectedElement.values || [];
    const prevValues = prevValuesRef.current || [];
    // Check if values actually changed from outside (not from our own updates)
    const valuesChanged = JSON.stringify(prevValues) !== JSON.stringify(currentValues);
    
    if (valuesChanged) {
      const newDisplayValues = {};
      currentValues.forEach((value, index) => {
        // Only update if this input is not currently focused
        if (!focusedInputs.current.has(index)) {
          if (value === 0 || value === undefined || value === null) {
            newDisplayValues[index] = '';
          } else {
            newDisplayValues[index] = value.toString();
          }
        }
      });
      setDisplayValues(prev => ({ ...prev, ...newDisplayValues }));
      prevValuesRef.current = currentValues;
    }
  }, [selectedElement.values]);

  const handleValueChange = (index, value) => {
    setDisplayValues(prev => ({ ...prev, [index]: value }));
    // Only update the actual value if it's not empty
    if (value !== '' && value !== null && value !== undefined) {
      const num = Number(value);
      const finalValue = Math.max(0, isNaN(num) ? 0 : num);
      const newValues = [...(selectedElement.values || [])];
      newValues[index] = finalValue;
      // For pie charts, clear series array to ensure values are used directly
      const updates = { values: newValues };
      if (selectedElement.chartType === 'pie') {
        updates.series = undefined;
      }
      updateSlideElement(selectedElement.id, updates);
    }
  };

  const handleValueFocus = (index) => {
    focusedInputs.current.add(index);
  };

  const handleValueBlur = (index) => {
    focusedInputs.current.delete(index);
    const displayValue = displayValues[index];
    // Convert empty string to 0 on blur
    if (displayValue === '' || displayValue === undefined || displayValue === null) {
      const newValues = [...(selectedElement.values || [])];
      newValues[index] = 0;
      // For pie charts, clear series array to ensure values are used directly
      const updates = { values: newValues };
      if (selectedElement.chartType === 'pie') {
        updates.series = undefined;
      }
      updateSlideElement(selectedElement.id, updates);
      setDisplayValues(prev => ({ ...prev, [index]: '' }));
    }
  };

  return (
    <>
      <div className="option-group" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(selectedElement.labels || []).map((label, index) => {
          const displayValue = displayValues[index] !== undefined 
            ? displayValues[index] 
            : ((selectedElement.values || [])[index] === 0 || (selectedElement.values || [])[index] === undefined || (selectedElement.values || [])[index] === null 
              ? '' 
              : ((selectedElement.values || [])[index]).toString());
          
          return (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(50px, 60px) 20px 24px',
                gap: 4,
                alignItems: 'center',
                width: '100%',
                minWidth: 0
              }}
            >
              <input
                type="text"
                value={label}
                onChange={(e) => {
                  const newLabels = [...(selectedElement.labels || [])];
                  newLabels[index] = e.target.value;
                  // For pie charts, clear series array to ensure values are used directly
                  const updates = { labels: newLabels };
                  if (selectedElement.chartType === 'pie') {
                    updates.series = undefined;
                  }
                  updateSlideElement(selectedElement.id, updates);
                }}
                placeholder="Label"
                style={{
                  padding: '4px 6px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                  fontSize: '12px',
                  minWidth: 0,
                  width: '100%'
                }}
              />
              <input
                type="number"
                value={displayValue}
                min="0"
                onChange={(e) => handleValueChange(index, e.target.value)}
                onFocus={() => handleValueFocus(index)}
                onBlur={() => handleValueBlur(index)}
                placeholder="Value"
                style={{
                  padding: '4px 6px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                  fontSize: '12px',
                  width: '100%'
                }}
              />
              <ModernColorPicker
                value={getBarColor(index)}
                onColorSelect={(color) => handleBarColorChange(index, color)}
                compact={true}
                buttonSize="20px"
                defaultColor={getBarColor(index)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeDataPoint(index);
                }}
                title="Remove"
                style={{
                  height: 24,
                  width: 24,
                  borderRadius: 4,
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#374151',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}

        {/* Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addDataPoint();
          }}
          title="Add data point"
          style={{
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#000000',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            marginTop: 4
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f9fafb';
            e.currentTarget.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          + Add Data Point
        </button>
      </div>
    </>
  );
};

export default PieChartDataPoints;

