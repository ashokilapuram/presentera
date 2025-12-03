import React, { useState, useRef, useEffect } from 'react';
import './Toolbar.css';
import FormattingContainer from './components/FormattingContainer';
import GeneralActions from './components/GeneralActions';
import FontSizeDropdown from './components/FontSizeDropdown';
import { applyFormat as applyFormatUtil, toggleStyle as toggleStyleUtil, restoreSelection } from './utils/formattingUtils';

const Toolbar = ({
  textFormatting,
  setTextFormatting,
  selectedElement,
  updateSlideElement,
  onShowTemplates,
  onActiveTabChange,
  onStartFullScreenSlideshow,
  onDownloadPresentation,
  isDownloading = false,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  slides,
  onBackToLanding,
  setShowDragMessage,
  onReset,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  isFullscreen,
  onUploadPPTX,
  isUploading = false
}) => {
  const [viewMode, setViewMode] = useState('normal');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [activeDropdown, setActiveDropdown] = useState(null);

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 80, 120, 150, 170, 200];

  // 🔄 Keep toolbar in sync when a new textbox is selected
  useEffect(() => {
    if (selectedElement && selectedElement.type === 'text') {
      setTextFormatting(prev => ({
        ...prev,
        letterSpacing: selectedElement.letterSpacing ?? 0,
        lineHeight: selectedElement.lineHeight ?? 1.2,
        textTransform: selectedElement.textTransform ?? 'none',
        listType: selectedElement.listType ?? 'none',
      }));
    } else {
      setTextFormatting(prev => ({
        ...prev,
        letterSpacing: 0,
        lineHeight: 1.2,
        textTransform: 'none',
        listType: 'none',
      }));
    }
  }, [selectedElement, setTextFormatting]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-trigger')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Wrapper functions for formatting utilities
  const applyFormat = (property, value) => {
    applyFormatUtil(property, value, selectedElement, updateSlideElement, textFormatting, setTextFormatting);
  };

  const toggleStyle = (property) => {
    toggleStyleUtil(property, selectedElement, updateSlideElement, textFormatting, setTextFormatting);
  };

  // Font size controls
  const increaseFontSize = () => {
    const currentSize = selectedElement?.fontSize || textFormatting.fontSize || 16;
    const currentIndex = fontSizes.indexOf(currentSize);
    const nextSize = currentIndex >= 0 && currentIndex < fontSizes.length - 1 
      ? fontSizes[currentIndex + 1] 
      : currentSize + 2;
    applyFormat('fontSize', nextSize);
  };

  const decreaseFontSize = () => {
    const currentSize = selectedElement?.fontSize || textFormatting.fontSize || 16;
    const currentIndex = fontSizes.indexOf(currentSize);
    const prevSize = currentIndex > 0 
      ? fontSizes[currentIndex - 1] 
      : Math.max(8, currentSize - 2);
    applyFormat('fontSize', prevSize);
  };

  // List type toggle
  const toggleListType = () => {
    const order = ['none', 'bullet'];
    const current = selectedElement?.listType || textFormatting.listType || 'none';
    // If current is 'number', treat it as 'none' to transition away from numbered lists
    const normalizedCurrent = current === 'number' ? 'none' : current;
    const next = order[(order.indexOf(normalizedCurrent) + 1) % order.length];
    
    if (selectedElement?.id) {
      updateSlideElement(selectedElement.id, { listType: next });
    }

    const newFormat = { ...textFormatting, listType: next };
    setTextFormatting(newFormat);
  };

  // Dropdown handlers
  const openDropdown = (e, type) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width
    });
    setActiveDropdown(type);
  };

  const openSpacing = (rect) => {
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
    setActiveDropdown('spacing');
  };

  // Color picker handlers
  const handleColorButtonClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (selectedElement && selectedElement.type === 'text') {
      const textElement = document.querySelector(`[data-element-id="${selectedElement.id}"]`);
      if (textElement) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
          window.__PRESENTIFY_SELECTION__ = {
            element: textElement,
            range: selection.getRangeAt(0).cloneRange()
          };
        }
      }
    }
    
    const colorInput = e.currentTarget.parentElement.querySelector('.color-picker');
    if (colorInput) {
      colorInput.click();
    }
  };

  const handleColorChange = (e) => {
    e.stopPropagation();
    e.preventDefault();
    restoreSelection();
    applyFormat('color', e.target.value);
  };

  // Check if text formatting options should be shown
  const shouldShowTextFormatting = () => {
    return selectedElement && selectedElement.type === 'text';
  };

  return (
    <div className="toolbar">
      <div className="toolbar-top">
        <div 
          className="toolbar-logo"
          onClick={onBackToLanding}
          style={{ cursor: 'pointer' }}
          title="Back to Landing Page"
        >
          <img 
            src="/images/logo/presentera_logo.png" 
            alt="Presentera Logo" 
            className="toolbar-logo-icon"
          />
          <img 
            src="/images/logo/presentera_name.png" 
            alt="Presentera" 
            className="toolbar-logo-name"
          />
        </div>

        <div className="toolbar-actions">
          {/* Text Formatting Options - Only show when text is selected */}
          {shouldShowTextFormatting() && (
            <FormattingContainer
              selectedElement={selectedElement}
              textFormatting={textFormatting}
              activeDropdown={activeDropdown}
              dropdownPos={dropdownPos}
              onOpenDropdown={openDropdown}
              onOpenSpacing={openSpacing}
              onApplyFormat={applyFormat}
              onToggleStyle={toggleStyle}
              onDecreaseFontSize={decreaseFontSize}
              onIncreaseFontSize={increaseFontSize}
              onToggleAlignment={(next) => applyFormat('textAlign', next)}
              onToggleList={toggleListType}
              onToggleCapitalize={(next) => applyFormat('textTransform', next)}
              onColorButtonClick={handleColorButtonClick}
              onColorChange={handleColorChange}
              setActiveDropdown={setActiveDropdown}
            />
          )}

          {/* Separator for general actions */}
          <div className="formatting-separator">|</div>

          {/* General Actions - Always visible */}
          <GeneralActions
            canUndo={canUndo}
            canRedo={canRedo}
            isFullscreen={isFullscreen}
            onUndo={onUndo}
            onRedo={onRedo}
            onStartFullScreenSlideshow={onStartFullScreenSlideshow}
            onDownloadPresentation={onDownloadPresentation}
            isDownloading={isDownloading}
            onToggleFullscreen={onToggleFullscreen}
            onReset={onReset}
            zoom={zoom}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onResetZoom={onResetZoom}
            onUploadPPTX={onUploadPPTX}
            isUploading={isUploading}
          />
        </div>
      </div>

      {/* Font Size Dropdown Portal */}
      <FontSizeDropdown
        activeDropdown={activeDropdown}
        dropdownPos={dropdownPos}
        onApplyFormat={(property, value) => {
          applyFormat(property, value);
          setActiveDropdown(null);
        }}
      />
    </div>
  );
};

export default Toolbar;
