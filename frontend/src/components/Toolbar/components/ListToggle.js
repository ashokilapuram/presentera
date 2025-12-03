import React from 'react';
import { List } from 'lucide-react';

/**
 * List toggle button component
 */
const ListToggle = ({ 
  selectedElement, 
  textFormatting, 
  onToggleList 
}) => {
  const current = selectedElement?.listType || textFormatting.listType || 'none';
  // Normalize 'number' to 'none' for display purposes
  const normalizedCurrent = current === 'number' ? 'none' : current;
  
  const getTitle = () => {
    if (normalizedCurrent === 'none') return 'Bullet List';
    return 'Turn Off List';
  };

  return (
    <button
      className={`toolbar-button ${normalizedCurrent !== 'none' ? 'active' : ''}`}
      title={getTitle()}
      onClick={(e) => {
        e.stopPropagation();
        onToggleList();
      }}
    >
      <List size={16} strokeWidth={2} />
    </button>
  );
};

export default ListToggle;

