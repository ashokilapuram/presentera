import React from 'react';
import { Trash2 } from 'lucide-react';
import ModernColorPicker from '../../shared/ModernColorPicker';

/**
 * Component for chart options controls (text color and background color)
 */
const ChartOptionsControls = ({ selectedElement, updateSlideElement }) => {
  // Get the current text color (prioritize labelsColor, then chartNameColor, then yAxisColor, then default)
  const getTextColor = () => {
    return selectedElement.labelsColor || selectedElement.chartNameColor || selectedElement.yAxisColor || '#374151';
  };

  // Handle text color change - sync labels, values, chart name color, and y-axis color
  const handleTextColorChange = (color) => {
    const updates = {
      labelsColor: color,
      chartNameColor: color
    };
    
    // If valuesColor exists, sync it too
    if (selectedElement.valuesColor !== undefined) {
      updates.valuesColor = color;
    }
    
    // Always sync yAxisColor for bar and line charts
    if (selectedElement.chartType === 'bar' || selectedElement.chartType === 'line') {
      updates.yAxisColor = color;
    }
    
    updateSlideElement(selectedElement.id, updates);
  };

  return (
    <div className="option-group chart-options-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.75rem',
      padding: '0.75rem'
    }}>
      {/* Chart Options Label */}
      <div className="chart-options-label" style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#404040',
        marginBottom: '0.25rem'
      }}>
        Chart Options
      </div>

      {/* Options Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '0.5rem',
        width: '100%'
      }}>
        {/* Text Color */}
        <div className="chart-option-item" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem',
          background: '#f3f4f6',
          borderRadius: '0.5rem',
          border: 'none',
          minHeight: '36px'
        }}>
          <label style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#374151',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center'
          }}>
            Text
          </label>
          <ModernColorPicker
            value={getTextColor()}
            onColorSelect={handleTextColorChange}
            compact={true}
            buttonSize="20px"
            defaultColor="#374151"
          />
        </div>

        {/* Background Color */}
        <div className="chart-option-item chart-background-item" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem',
          background: '#f3f4f6',
          borderRadius: '0.5rem',
          border: 'none',
          minHeight: '36px',
          position: 'relative'
        }}>
          <label style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#374151',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center'
          }}>
            Background
          </label>
          <ModernColorPicker
            value={selectedElement.backgroundColor || 'transparent'}
            onColorSelect={(color) => updateSlideElement(selectedElement.id, { backgroundColor: color === 'transparent' ? undefined : color })}
            compact={true}
            buttonSize="20px"
            defaultColor="#ffffff"
            buttonStyle={{
              backgroundColor: selectedElement.backgroundColor || '#ffffff',
              border: selectedElement.backgroundColor ? '1px solid rgba(0, 0, 0, 0.1)' : '1px dashed #9ca3af'
            }}
          />
          {selectedElement.backgroundColor && (
            <button
              className="chart-background-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                updateSlideElement(selectedElement.id, { backgroundColor: undefined });
              }}
              title="Remove background color"
              style={{
                width: '20px',
                height: '20px',
                minWidth: '20px',
                minHeight: '20px',
                border: 'none',
                borderRadius: '0.25rem',
                background: '#f3f4f6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.2s ease',
                flexShrink: 0,
                marginLeft: 'auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Trash2 className="delete-icon" size={12} style={{ color: '#ef4444' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartOptionsControls;

