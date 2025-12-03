import React from 'react';

/**
 * Font size controls component (increment/decrement)
 */
const FontSizeControls = ({ 
  selectedElement, 
  textFormatting, 
  onDecrease, 
  onIncrease 
}) => {
  return (
    <div className="font-size-controls">
      <button
        className="toolbar-button font-size-btn"
        onClick={(e) => { 
          e.stopPropagation(); 
          onDecrease(); 
        }}
        title="Decrease font size"
      >
        -
      </button>
      <span className="font-size-display">
        {selectedElement?.fontSize || textFormatting.fontSize || 16}
      </span>
      <button
        className="toolbar-button font-size-btn"
        onClick={(e) => { 
          e.stopPropagation(); 
          onIncrease(); 
        }}
        title="Increase font size"
      >
        +
      </button>
    </div>
  );
};

export default FontSizeControls;

