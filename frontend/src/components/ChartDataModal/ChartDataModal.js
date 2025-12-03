import React, { useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './ChartDataModal.css';
import { useModalDrag } from './hooks/useModalDrag';
import { useModalResize } from './hooks/useModalResize';
import { useDataInitialization } from './hooks/useDataInitialization';
import { useLiveUpdates } from './hooks/useLiveUpdates';
import { useDataOperations } from './hooks/useDataOperations';
import ModalHeader from './components/ModalHeader';
import DataTable from './components/DataTable';
import ActionsBar from './components/ActionsBar';

const ChartDataModal = ({ isOpen, onClose, element, onSave, initialPosition }) => {
  const modalRef = useRef(null);
  const [shouldBlinkClose, setShouldBlinkClose] = useState(false);

  // Initialize data from element
  const { labels, series, setLabels, setSeries } = useDataInitialization(isOpen, element);

  // Calculate estimated position immediately for initial render (prevents center-to-button shift)
  const estimatedPosition = useMemo(() => {
    if (!initialPosition) return null;
    
    // Estimate modal dimensions based on CSS (max-width 600px, width 85%, height 320px)
    const estimatedWidth = Math.min(600, window.innerWidth * 0.85);
    const estimatedHeight = 320;
    const padding = 16;
    
    // Calculate initial position (below the button)
    let x = initialPosition.x - (estimatedWidth / 2) + (initialPosition.width / 2);
    let y = initialPosition.y + initialPosition.height + 8; // 8px gap below button
    
    // Adjust position to stay within viewport
    if (x + estimatedWidth > window.innerWidth - padding) {
      x = window.innerWidth - estimatedWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }
    if (y + estimatedHeight > window.innerHeight - padding) {
      if (initialPosition.y - estimatedHeight > padding) {
        y = initialPosition.y - estimatedHeight - 8; // 8px gap above button
      } else {
        y = window.innerHeight - estimatedHeight - padding;
      }
    }
    if (y < padding) {
      y = padding;
    }
    
    return { x, y };
  }, [initialPosition]);

  // Handle modal dragging with initial position
  const { position, setPosition, isDragging, handleMouseDown } = useModalDrag(
    isOpen, 
    modalRef,
    initialPosition
  );
  
  // Use estimated position if position is not set yet (for initial render)
  const displayPosition = position || estimatedPosition;

  // Handle modal resizing
  const { modalHeight, isResizing, handleResizeMouseDown, setIsResizing } = useModalResize(
    isOpen, 
    modalRef, 
    position,
    setPosition
  );

  // Handle live updates for bar/line charts
  useLiveUpdates(isOpen, element, labels, series, onSave);

  // Handle data operations
  const {
    handleLabelChange,
    handleSeriesNameChange,
    handleValueChange,
    addRow,
    removeRow,
    addSeries,
    removeSeries,
    handleSave,
    handleKeyDown
  } = useDataOperations(element, labels, series, setLabels, setSeries);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (isResizing || isDragging) {
      return;
    }
    // Instead of closing, blink the close button to indicate it can be clicked
    setShouldBlinkClose(true);
    // Reset after animation completes
    setTimeout(() => {
      setShouldBlinkClose(false);
    }, 600); // Match animation duration
  };

  return createPortal(
    <div className="chart-data-modal-overlay" onClick={handleOverlayClick}>
      <div 
        ref={modalRef}
        className={`chart-data-modal ${isDragging ? 'dragging' : ''}`}
        data-animate={!displayPosition ? 'true' : 'false'}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: displayPosition ? 'fixed' : 'absolute',
          left: displayPosition ? `${displayPosition.x}px` : '50%',
          top: displayPosition ? `${displayPosition.y}px` : '50%',
          transform: displayPosition ? 'none' : 'translate(-50%, -50%)',
          margin: 0,
          pointerEvents: 'auto',
          opacity: displayPosition ? 1 : undefined,
          height: modalHeight ? `${modalHeight}px` : undefined
        }}
      >
        <ModalHeader 
          onClose={onClose} 
          onMouseDown={handleMouseDown}
          shouldBlink={shouldBlinkClose}
        />
        
        <div className="chart-data-modal-content">
          <DataTable
            labels={labels}
            series={series}
            chartType={element?.chartType}
            onLabelChange={handleLabelChange}
            onValueChange={handleValueChange}
            onRemoveRow={removeRow}
            onSeriesNameChange={handleSeriesNameChange}
            onRemoveSeries={removeSeries}
            onAddSeries={addSeries}
            onKeyDown={handleKeyDown}
          />
          
          <ActionsBar
            onAddRow={addRow}
            onCancel={onClose}
            onSave={() => handleSave(onSave, onClose)}
          />
        </div>
        
        <div 
          className="chart-data-modal-resize-handle"
          onMouseDown={handleResizeMouseDown}
          onClick={(e) => e.stopPropagation()}
          onMouseUp={(e) => {
            e.stopPropagation();
            // Stop resizing and reset cursor when mouse is released on handle
            setIsResizing(false);
            if (document.body) {
              document.body.style.cursor = '';
              document.body.style.userSelect = '';
            }
          }}
        />
      </div>
    </div>,
    document.body
  );
};

export default ChartDataModal;
