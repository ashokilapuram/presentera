import React from 'react';

/**
 * Capitalize toggle button component
 */
const CapitalizeToggle = ({ 
  selectedElement, 
  textFormatting, 
  onToggleCapitalize 
}) => {
  return (
    <button
      className="toolbar-button"
      title="Toggle Uppercase / Lowercase"
      onClick={(e) => {
        e.stopPropagation();
        const current = selectedElement?.textTransform || textFormatting.textTransform || 'none';
        // Toggle between uppercase and lowercase only, skip 'none'
        const next = current === 'uppercase' ? 'lowercase' : 'uppercase';
        onToggleCapitalize(next);
      }}
    >
      <span style={{ fontWeight: 600 }}>Aa</span>
    </button>
  );
};

export default CapitalizeToggle;

