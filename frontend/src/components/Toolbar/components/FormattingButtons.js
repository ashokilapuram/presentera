import React from 'react';
import { FiBold, FiItalic, FiUnderline } from 'react-icons/fi';

/**
 * Formatting buttons component (Bold, Italic, Underline)
 */
const FormattingButtons = ({ 
  selectedElement, 
  textFormatting, 
  onToggleStyle 
}) => {
  return (
    <>
      <button 
        className={`toolbar-button ${(selectedElement?.fontWeight || textFormatting.fontWeight) === 'bold' ? 'active' : ''}`} 
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleStyle('fontWeight'); 
        }}
      >
        <FiBold size={14} />
      </button>
      <button 
        className={`toolbar-button ${(selectedElement?.fontStyle || textFormatting.fontStyle) === 'italic' ? 'active' : ''}`} 
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleStyle('fontStyle'); 
        }}
      >
        <FiItalic size={14} />
      </button>
      <button 
        className={`toolbar-button ${(selectedElement?.textDecoration || textFormatting.textDecoration) === 'underline' ? 'active' : ''}`} 
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleStyle('textDecoration'); 
        }}
      >
        <FiUnderline size={14} />
      </button>
    </>
  );
};

export default FormattingButtons;

