import React, { useRef } from 'react';

/**
 * Component for chart name input with edit data button
 */
const ChartNameInput = ({ 
  selectedElement, 
  updateSlideElement, 
  onEditDataClick 
}) => {
  const editDataButtonRef = useRef(null);
  
  const handleEditDataClick = (e) => {
    e.stopPropagation();
    if (editDataButtonRef.current && onEditDataClick) {
      const buttonRect = editDataButtonRef.current.getBoundingClientRect();
      
      // Pass the button's position and dimensions for accurate modal positioning
      onEditDataClick({
        x: buttonRect.left,
        y: buttonRect.top,
        width: buttonRect.width,
        height: buttonRect.height
      });
    } else if (onEditDataClick) {
      onEditDataClick(null);
    }
  };
  
  return (
    <div className="option-group chart-name-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.75rem',
      padding: '0.75rem'
    }}>
      {/* Chart Name Label */}
      <div className="chart-name-label" style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#404040',
        marginBottom: '0.25rem'
      }}>
        Chart Name
      </div>
      
      {/* Input and Button Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        width: '100%'
      }}>
        {/* Input Container */}
        <input
          type="text"
          className="chart-name-input"
          placeholder="chart name"
          value={selectedElement.chartName || ''}
          onChange={(e) => updateSlideElement(selectedElement.id, { chartName: e.target.value })}
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            padding: '0.5rem 0.75rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            background: '#f3f4f6',
            color: '#374151',
            transition: 'all 0.2s ease',
            height: '36px',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.background = '#ffffff';
            e.target.style.border = '1px solid #000000';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.background = '#f3f4f6';
            e.target.style.border = 'none';
            e.target.style.boxShadow = 'none';
          }}
        />
        
        {/* Edit Data Button */}
        {selectedElement.chartType !== 'pie' && onEditDataClick && (
          <button
            ref={editDataButtonRef}
            onClick={handleEditDataClick}
            className="chart-edit-data-button"
            title="Edit chart data"
            style={{
              flex: '0 0 auto',
              padding: '0.5rem 0.75rem',
              height: '36px',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1a1a1a';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#000000';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Edit Data
          </button>
        )}
      </div>
    </div>
  );
};

export default ChartNameInput;

