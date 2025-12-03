import React from 'react';
import { FiLayers, FiTrash } from 'react-icons/fi';
import {
  ArrowUpFromLine,
  ArrowUpNarrowWide,
  ArrowDownFromLine,
  ArrowDownNarrowWide,
} from 'lucide-react';

const LayerActions = ({
  selectedElement,
  currentSlide,
  bringForward,
  bringToFront,
  sendBackward,
  sendToBack,
  updateSlide,
  deleteElement
}) => {
  const handleDuplicate = (e) => {
    e.stopPropagation();
    if (selectedElement) {
      const newElement = {
        ...selectedElement,
        id: `element_${Date.now()}`,
        x: selectedElement.x + 20,
        y: selectedElement.y + 20
      };
      const updatedElements = [...(currentSlide?.elements || []), newElement];
      updateSlide && updateSlide({ elements: updatedElements });
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (selectedElement && deleteElement) {
      deleteElement(selectedElement.id);
    }
  };

  return (
    <div className="element-actions-container">
      <button 
        className="action-button-icon"
        onClick={bringForward} 
        title="Bring Forward One Layer"
      >
        <ArrowUpFromLine size={16} strokeWidth={2} />
      </button>
      <button 
        className="action-button-icon"
        onClick={bringToFront} 
        title="Bring To Front"
      >
        <ArrowUpNarrowWide size={16} strokeWidth={2} />
      </button>
      <button 
        className="action-button-icon"
        onClick={sendBackward} 
        title="Send Backward One Layer"
      >
        <ArrowDownFromLine size={16} strokeWidth={2} />
      </button>
      <button 
        className="action-button-icon"
        onClick={sendToBack} 
        title="Send To Back"
      >
        <ArrowDownNarrowWide size={16} strokeWidth={2} />
      </button>
      <button 
        className="action-button-icon"
        onClick={handleDuplicate}
        title="Duplicate"
      >
        <FiLayers size={16} />
      </button>
      <button 
        className="action-button-icon danger"
        onClick={handleDelete}
        title="Delete"
      >
        <FiTrash size={16} />
      </button>
    </div>
  );
};

export default React.memo(LayerActions);

