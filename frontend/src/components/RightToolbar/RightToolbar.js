import React, { useState, useRef, useEffect } from 'react';
import './RightToolbar.css';
import DesignSection from './sections/DesignSection';
import InsertSection from './sections/InsertSection';
import DefaultSection from './sections/DefaultSection';
import TextOptions from './sections/TextOptions';
import ShapeOptions from './sections/ShapeOptions';
import ImageOptions from './sections/ImageOptions';
import ChartOptions from './sections/ChartOptions';
import TableOptions from './sections/TableOptions';
import ClipartOptions from './sections/ClipartOptions';

const RightToolbar = ({ 
  selectedElement, 
  textFormatting,
  setTextFormatting, 
  updateSlideElement,
  updateSlide,
  currentSlide,
  currentSlideIndex,
  addTextBox,
  addShape,
  addImage,
  addClipart,
  addChart,
  addTable,
  bringForward,
  bringToFront,
  sendBackward,
  sendToBack,
  deleteElement,
  deselectElement,
  onTabChange,
  slides,
  forceTab,
  onTabForced,
  updateAllSlides,
  onCurrentTabChange,
  pushSnapshot,
}) => {
  const [activeTab, setActiveTab] = useState('Insert');
  const [showClipartOptions, setShowClipartOptions] = useState(false);
  
  // Sliding highlight indicator state
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // Handle forced tab changes from parent
  useEffect(() => {
    if (forceTab) {
      setActiveTab(forceTab);
      if (onTabForced) {
        onTabForced();
      }
    }
  }, [forceTab, onTabForced]);

  // Notify parent of current tab when it changes (for preservation)
  useEffect(() => {
    if (onCurrentTabChange && !selectedElement && !showClipartOptions) {
      onCurrentTabChange(activeTab);
    }
  }, [activeTab, onCurrentTabChange, selectedElement, showClipartOptions]);

  // Close clipart options when element is selected
  useEffect(() => {
    if (selectedElement) {
      setShowClipartOptions(false);
    }
  }, [selectedElement]);

  const updateIndicator = () => {
    const container = tabsContainerRef.current;
    const el = tabRefs.current[activeTab];
    if (!container || !el) return;
    const cRect = container.getBoundingClientRect();
    const tRect = el.getBoundingClientRect();
    const left = tRect.left - cRect.left;
    const width = tRect.width;
    setIndicator({ left, width });
  };

  useEffect(() => {
    updateIndicator();
    const handle = () => updateIndicator();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Call the parent tab change handler to deselect element
    if (onTabChange) {
      onTabChange(tab);
    }
    // Notify parent of current tab for preservation
    if (onCurrentTabChange) {
      onCurrentTabChange(tab);
    }
  };

  const renderContent = () => {
    // Clipart options take priority when active
    if (showClipartOptions) {
      return (
        <ClipartOptions
          addClipart={(imageUrl, imageName) => {
            if (addClipart) {
              addClipart(imageUrl, imageName);
            }
            setShowClipartOptions(false);
          }}
          onClose={() => setShowClipartOptions(false)}
        />
      );
    }

    // Element-specific options take priority
    if (selectedElement && selectedElement.type === 'text') {
      return (
        <TextOptions
          selectedElement={selectedElement}
          textFormatting={textFormatting}
          setTextFormatting={setTextFormatting}
          updateSlideElement={updateSlideElement}
          bringForward={bringForward}
          bringToFront={bringToFront}
          sendBackward={sendBackward}
          sendToBack={sendToBack}
          updateSlide={updateSlide}
          currentSlide={currentSlide}
          deleteElement={deleteElement}
        />
      );
    }

    if (selectedElement && selectedElement.type === 'shape') {
      return (
        <ShapeOptions
          selectedElement={selectedElement}
          updateSlideElement={updateSlideElement}
          bringForward={bringForward}
          bringToFront={bringToFront}
          sendBackward={sendBackward}
          sendToBack={sendToBack}
          updateSlide={updateSlide}
          currentSlide={currentSlide}
          deleteElement={deleteElement}
        />
      );
    }

    if (selectedElement && selectedElement.type === 'image') {
      return (
        <ImageOptions
          selectedElement={selectedElement}
          updateSlideElement={updateSlideElement}
          bringForward={bringForward}
          bringToFront={bringToFront}
          sendBackward={sendBackward}
          sendToBack={sendToBack}
          updateSlide={updateSlide}
          currentSlide={currentSlide}
          deleteElement={deleteElement}
        />
      );
    }

    if (selectedElement && selectedElement.type === 'chart') {
      return (
        <ChartOptions
          selectedElement={selectedElement}
          updateSlideElement={updateSlideElement}
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          pushSnapshot={pushSnapshot}
          bringForward={bringForward}
          bringToFront={bringToFront}
          sendBackward={sendBackward}
          sendToBack={sendToBack}
          updateSlide={updateSlide}
          currentSlide={currentSlide}
          deleteElement={deleteElement}
        />
      );
    }

    if (selectedElement && selectedElement.type === 'table') {
      return (
        <TableOptions
          selectedElement={selectedElement}
          updateSlideElement={updateSlideElement}
          bringForward={bringForward}
          bringToFront={bringToFront}
          sendBackward={sendBackward}
          sendToBack={sendToBack}
          updateSlide={updateSlide}
          currentSlide={currentSlide}
          deleteElement={deleteElement}
        />
      );
    }

    // Default tab-based sections
    switch (activeTab) {
      case 'Design':
        return <DesignSection updateSlide={updateSlide} currentSlide={currentSlide} slides={slides} updateAllSlides={updateAllSlides} />;
      case 'Insert':
        return (
          <InsertSection
            addTextBox={addTextBox}
            addShape={addShape}
            addChart={addChart}
            addImage={addImage}
            onClipartClick={() => setShowClipartOptions(true)}
            addTable={addTable}
          />
        );
      default:
        return (
          <DefaultSection
            selectedElement={selectedElement}
            updateSlideElement={updateSlideElement}
            addTextBox={addTextBox}
            addShape={addShape}
            addImage={addImage}
          />
        );
    }
  };

  return (
    <div className="right-toolbar">
      <div className="right-toolbar-header">
        <div className="right-toolbar-tabs" ref={tabsContainerRef} style={{ position: 'relative' }}>
          {/* Sliding highlight - only show when no element is selected and clipart options not shown */}
          {!selectedElement && !showClipartOptions && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: indicator.width,
                height: '2px',
                transform: `translateX(${indicator.left}px)`,
                background: '#000000',
                transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '1px',
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />
          )}
          {['Design', 'Insert'].map((tab) => (
            <button
              key={tab}
              ref={(el) => { tabRefs.current[tab] = el; }}
              className={`right-toolbar-tab ${!selectedElement && !showClipartOptions && activeTab === tab ? 'active' : ''}`}
              onClick={() => {
                handleTabChange(tab);
                setShowClipartOptions(false);
              }}
              style={{ position: 'relative', zIndex: 1, background: 'transparent' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="right-toolbar-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default RightToolbar;
