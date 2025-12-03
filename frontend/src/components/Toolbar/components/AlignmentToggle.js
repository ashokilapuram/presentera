import React from 'react';
import { FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify } from 'react-icons/fi';

/**
 * Alignment toggle button component
 */
const AlignmentToggle = ({ 
  selectedElement, 
  textFormatting, 
  onToggleAlignment 
}) => {
  const current = selectedElement?.textAlign || textFormatting.textAlign || 'left';
  
  const getIcon = () => {
    switch (current) {
      case 'center': return <FiAlignCenter size={16} />;
      case 'right': return <FiAlignRight size={16} />;
      case 'justify': return <FiAlignJustify size={16} />;
      default: return <FiAlignLeft size={16} />;
    }
  };

  return (
    <button
      className="toolbar-button"
      title="Toggle text alignment"
      onClick={(e) => {
        e.stopPropagation();
        const order = ['left', 'center', 'right', 'justify'];
        const next = order[(order.indexOf(current) + 1) % order.length];
        onToggleAlignment(next);
      }}
    >
      {getIcon()}
    </button>
  );
};

export default AlignmentToggle;

