import React, { useState, useRef, useEffect } from 'react';
import LayerActions from '../shared/LayerActions';
import ChartDataModal from '../../ChartDataModal/ChartDataModal';
import ChartNameInput from './components/ChartNameInput';
import PieChartDataPoints from './components/PieChartDataPoints';
import BarLineColorPalettes from './components/BarLineColorPalettes';
import ChartOptionsControls from './components/ChartOptionsControls';
import { getBarColor, handleBarColorChange, removeDataPoint, addDataPoint } from './utils/chartHelpers';

const ChartOptions = ({
  selectedElement,
  updateSlideElement,
  slides,
  currentSlideIndex,
  pushSnapshot,
  bringForward,
  bringToFront,
  sendBackward,
  sendToBack,
  updateSlide,
  currentSlide,
  deleteElement
}) => {
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [modalInitialPosition, setModalInitialPosition] = useState(null);
  const hasLiveSnapshotRef = useRef(false);

  useEffect(() => {
    hasLiveSnapshotRef.current = false;
  }, [selectedElement?.id, isDataModalOpen]);
  
  const handleSaveData = (updates, options = {}) => {
    if (!selectedElement) return;
    
    const isLiveUpdate = Boolean(options.isLive);
    
    if (isLiveUpdate) {
      // Live update (debounced): save snapshot BEFORE each update for proper undo/redo
      // Each debounced update creates a separate undo point
      if (pushSnapshot) {
        try {
          pushSnapshot({
            slides,
            selectedElement,
            currentSlideIndex
          });
        } catch (error) {
          console.error('Failed to snapshot chart edit:', error);
        }
      }
      // Mark that we've saved a snapshot for this editing session
      hasLiveSnapshotRef.current = true;
      // Use __internal to prevent updateSlideElement from creating another snapshot
      updateSlideElement(selectedElement.id, { ...updates, __internal: 'chart-live' });
    } else {
      // Save button clicked: only save snapshot if one wasn't already saved during live updates
      // If hasLiveSnapshotRef is true, we already have a snapshot, so skip it
      // If false (e.g., pie charts or no edits made), we need a snapshot
      if (hasLiveSnapshotRef.current) {
        // Snapshot already saved during live updates, don't save another one
        updateSlideElement(selectedElement.id, { ...updates, __internal: 'chart-save' });
      } else {
        // No snapshot saved yet, let updateSlideElement save it normally
        updateSlideElement(selectedElement.id, updates);
      }
      hasLiveSnapshotRef.current = false;
    }
  };

  const handleEditDataClick = (position) => {
    setModalInitialPosition(position);
    setIsDataModalOpen(true);
  };

  // Helper functions that use the selectedElement
  const getBarColorForIndex = (index) => getBarColor(selectedElement, index);
  const handleBarColorChangeForIndex = (index, color) => handleBarColorChange(selectedElement, updateSlideElement, index, color);
  const removeDataPointAtIndex = (index) => removeDataPoint(selectedElement, updateSlideElement, index);
  const addDataPointHandler = () => addDataPoint(selectedElement, updateSlideElement);

  return (
    <div className="right-toolbar-section">
      <ChartNameInput
        selectedElement={selectedElement}
        updateSlideElement={updateSlideElement}
        onEditDataClick={handleEditDataClick}
      />

      {/* Data points - Only for pie charts */}
      {selectedElement.chartType === 'pie' && (
        <PieChartDataPoints
          selectedElement={selectedElement}
          updateSlideElement={updateSlideElement}
          getBarColor={getBarColorForIndex}
          handleBarColorChange={handleBarColorChangeForIndex}
          removeDataPoint={removeDataPointAtIndex}
          addDataPoint={addDataPointHandler}
        />
      )}

      {/* Color Palettes - Only for bar and line charts */}
      {(selectedElement.chartType === 'bar' || selectedElement.chartType === 'line') && (
        <BarLineColorPalettes
          selectedElement={selectedElement}
          updateSlideElement={updateSlideElement}
        />
      )}

      <ChartOptionsControls
        selectedElement={selectedElement}
        updateSlideElement={updateSlideElement}
      />

      <div className="section-title">Element Actions</div>
      <div className="option-group">
        <LayerActions
          selectedElement={selectedElement}
          currentSlide={currentSlide}
          bringForward={bringForward}
          bringToFront={bringToFront}
          sendBackward={sendBackward}
          sendToBack={sendToBack}
          updateSlide={updateSlide}
          deleteElement={deleteElement}
        />
      </div>

      <ChartDataModal
        isOpen={isDataModalOpen}
        onClose={() => {
          setIsDataModalOpen(false);
          setModalInitialPosition(null);
        }}
        element={selectedElement}
        onSave={handleSaveData}
        initialPosition={modalInitialPosition}
      />
    </div>
  );
};

export default ChartOptions;
