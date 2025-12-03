import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import EditableTextBox from '../EditableTextBox/EditableTextBox';
import KonvaShape from '../KonvaShape/KonvaShape';
import ImageBox from '../ImageBox/ImageBox';
import ChartBox from '../ChartBox/ChartBox';
import TableBox from '../TableBox/TableBox';
import ContextMenu from '../ContextMenu/ContextMenu';
import GradientBackground from './GradientBackground';

const KonvaCanvas = ({
  slide,
  updateSlideElement,
  setSelectedElement,
  selectedElement,
  deleteElement,
  updateSlide,
  onThumbnailUpdate,   // ✅ new prop
  onOpenDesignTab,
  bringForward,
  bringToFront,
  sendBackward,
  sendToBack,
  copiedElement,
  setCopiedElement,
  readOnly = false,
  zoom = 100,
  currentSlideIndex,
  duplicateSlide,
  addSlideBefore,
  addSlideAfter,
  onChartExportReady,  // ✅ new prop for chart export
  currentRightToolbarTab,  // ✅ current tab state
}) => {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 800, height: 450 }); // 16:9
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, position: null });
  const chartExporters = useRef({}); // Store chart export functions

  // Responsive scaling logic with zoom
  useEffect(() => {
    const handleResize = () => {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const container = document.querySelector('.canvas-container');
        if (!container) return;
        
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const baseWidth = 1024;
        const baseHeight = 576;
        const zoomFactor = zoom / 100;
        
        // Check if we're in fullscreen slideshow (check for fullscreen-slideshow parent)
        const isInSlideshow = container.closest('.fullscreen-slideshow') !== null;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isFullscreen = isInSlideshow || (containerWidth >= viewportWidth * 0.85 && 
                          containerHeight >= viewportHeight * 0.85);
        
        if (isFullscreen) {
          // Fullscreen mode: scale based on screen width, height maintains ratio automatically
          // Use the larger of container or viewport to ensure we fill the screen
          const actualWidth = Math.max(containerWidth, viewportWidth);
          const scaleFactor = (actualWidth / baseWidth) * zoomFactor;
          setScale(scaleFactor);
          setIsFullscreenMode(true);
          setStageSize({
            width: baseWidth,
            height: baseHeight,
          });
        } else {
          setIsFullscreenMode(false);
          // Normal mode: scale based on container width with zoom
          const scaleFactor = (containerWidth / baseWidth) * zoomFactor;
          setScale(scaleFactor);
          setStageSize({
            width: baseWidth * scaleFactor,
            height: baseHeight * scaleFactor,
          });
        }
      });
    };
    
    // Initial resize with a small delay to ensure DOM is ready
    setTimeout(handleResize, 100);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [zoom]);

  // Ensure high-quality canvas rendering in fullscreen
  useEffect(() => {
    if (stageRef.current && isFullscreenMode) {
      const stage = stageRef.current;
      
      // Set high pixel ratio on stage
      const pixelRatio = Math.max(window.devicePixelRatio || 2, 3);
      stage.pixelRatio(pixelRatio);
      
      const layers = stage.getLayers();
      layers.forEach((layer) => {
        const canvas = layer.getCanvas();
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Enable high-quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
          }
        }
      });
      
      // Force redraw with high quality
      stage.batchDraw();
      
      // Redraw again after a short delay to ensure settings are applied
      setTimeout(() => {
        stage.batchDraw();
      }, 100);
    }
  }, [isFullscreenMode, slide, scale]);

  useEffect(() => {
    if (stageRef.current && typeof onThumbnailUpdate === 'function') {
      const dataURL = stageRef.current.toDataURL({ 
        pixelRatio: 0.25,
        mimeType: 'image/png',
        quality: 1
      });
      // Pass slide.id along with the thumbnail data to avoid stale index issues
      onThumbnailUpdate(slide.id, dataURL);
    }
  }, [slide, scale, onThumbnailUpdate]);

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ visible: false, position: null });
  };

  // Close context menu when slide changes
  useEffect(() => {
    closeContextMenu();
  }, [slide?.id]);


  // Load background image when slide backgroundImage changes
  useEffect(() => {
    if (slide?.backgroundImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setBackgroundImage(img);
      };
      img.onerror = () => {
        console.error('Failed to load background image');
        setBackgroundImage(null);
      };
      img.src = slide.backgroundImage;
    } else {
      setBackgroundImage(null);
    }
  }, [slide?.backgroundImage]);

  // Convert screen coordinates to stage coordinates
  // Uses Konva's internal coordinate system accounting for scale, position, and container offset
  const screenToStage = useCallback((screenX, screenY) => {
    const stage = stageRef.current;
    if (!stage) return null;

    try {
      const container = stage.container();
      if (!container) return null;

      // Get the container's bounding rectangle (accounts for scroll, position, etc.)
      const rect = container.getBoundingClientRect();
      
      // Get stage transform properties
      const stagePos = stage.position();
      const scaleX = stage.scaleX();
      const scaleY = stage.scaleY();
      
      // Calculate relative position within container
      const relativeX = screenX - rect.left;
      const relativeY = screenY - rect.top;
      
      // Convert to stage coordinates: (relativePos - stagePos) / scale
      // This is the inverse of stage-to-screen transformation
      const x = (relativeX - (stagePos.x || 0)) / scaleX;
      const y = (relativeY - (stagePos.y || 0)) / scaleY;
      
      // Validate coordinates
      if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        return null;
      }
      
      return { x, y };
    } catch (error) {
      console.error('Error in screenToStage:', error);
      return null;
    }
  }, []);

  // Find element at stage coordinates
  // Checks elements in reverse order (topmost first) and handles rotation
  const findElementAtPosition = useCallback((stageX, stageY) => {
    if (!slide?.elements || slide.elements.length === 0) return null;

    // Check elements in reverse order (topmost first)
    for (let i = slide.elements.length - 1; i >= 0; i--) {
      const el = slide.elements[i];
      const elX = el.x || 0;
      const elY = el.y || 0;
      const elWidth = el.width || 0;
      const elHeight = el.height || 0;
      
      // Skip elements with invalid dimensions
      if (elWidth <= 0 || elHeight <= 0) continue;
      
      // Check if point is within element bounds
      if (!el.rotation || Math.abs(el.rotation) < 0.01) {
        // Non-rotated element: simple bounding box check
        if (
          stageX >= elX &&
          stageX <= elX + elWidth &&
          stageY >= elY &&
          stageY <= elY + elHeight
        ) {
          return el;
        }
      } else {
        // Rotated element: transform point to element's local space
        const centerX = elX + elWidth / 2;
        const centerY = elY + elHeight / 2;
        const angle = -el.rotation * Math.PI / 180; // Convert to radians, negate for Konva
        
        // Translate point relative to element center
        const dx = stageX - centerX;
        const dy = stageY - centerY;
        
        // Rotate point back (inverse rotation)
        const cos = Math.cos(-angle);
        const sin = Math.sin(-angle);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;
        
        // Check if point is within unrotated rectangle
        if (
          Math.abs(localX) <= elWidth / 2 &&
          Math.abs(localY) <= elHeight / 2
        ) {
          return el;
        }
      }
    }
    
    return null;
  }, [slide]);


  // Handle element selection
  const handleElementClick = useCallback((element) => {
    setSelectedElement(element);
  }, []);

  // Handle element drag end
  const handleDragEnd = (element, e) => {
    updateSlideElement(element.id, {
      x: e.target.x(),
      y: e.target.y()
    });
  };

  // Attach native contextmenu listener directly to the Konva canvas (Chrome + Edge compatible)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Get the container div that wraps the canvas
    const container = stage.container ? stage.container() : null;
    if (!container) return;

    // Get the actual canvas element or the content wrapper
    const content = container.querySelector('.konvajs-content') || container.querySelector('canvas') || container;
    if (!content) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) {
        e.stopImmediatePropagation();
      }

      const x = e.clientX;
      const y = e.clientY;

      // Convert screen coordinates to stage coordinates
      const pointerPos = screenToStage(x, y);

      // Always show context menu on right-click
      // The menu will show element options if selectedElement exists, otherwise background options
      setContextMenu((prev) => {
        if (prev.visible) return prev;
        return { 
          visible: true, 
          position: { x, y },
          stagePosition: pointerPos // Store stage coordinates for paste
        };
      });
    };

    content.addEventListener('contextmenu', handleContextMenu, { capture: true, passive: false });

    return () => {
      content.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, [slide, scale, screenToStage, findElementAtPosition]); // Re-attach when slide or scale changes


  // Render slide elements
  const renderElements = () => {
    if (!slide?.elements) return null;

    return slide.elements.map((element) => {
      if (element.type === 'text') {
        return (
          <EditableTextBox
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => handleElementClick(element)}
            onChange={(updates) => {
              // update element in slides state
              updateSlideElement(element.id, updates);
              // immediately update selectedElement in parent to the latest merged object
              // so selection doesn't point to a stale object after update
              setSelectedElement(prev => {
                // If previously selected isn't this element, don't override selection
                if (!prev || prev.id !== element.id) return prev;
                return { ...prev, ...updates };
              });
            }}
            readOnly={readOnly}
          />
        );
      }

      if (element.type === 'shape') {
        return (
          <KonvaShape
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => handleElementClick(element)}
            onChange={(updates) => updateSlideElement(element.id, updates)}
            readOnly={readOnly}
          />
        );
      }

      if (element.type === 'image') {
        return (
          <ImageBox
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => handleElementClick(element)}
            onChange={(updates) => updateSlideElement(element.id, updates)}
            readOnly={readOnly}
          />
        );
      }

      if (element.type === 'chart') {
        return (
          <ChartBox
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => handleElementClick(element)}
            onChange={(updates) => updateSlideElement(element.id, updates)}
            readOnly={readOnly}
            onExport={(exportFn) => {
              chartExporters.current[element.id] = exportFn;
              // Notify parent that chart exporter is ready
              if (onChartExportReady) {
                onChartExportReady(chartExporters.current);
              }
            }}
          />
        );
      }

      if (element.type === 'table') {
        return (
          <TableBox
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => handleElementClick(element)}
            onChange={(updates) => {
              // update element in slides state
              updateSlideElement(element.id, updates);
              // immediately update selectedElement in parent to the latest merged object
              setSelectedElement(prev => {
                if (!prev || prev.id !== element.id) return prev;
                return { ...prev, ...updates };
              });
            }}
            readOnly={readOnly}
          />
        );
      }

      return null;
    });
  };

  return (
    <div className="canvas-container">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        pixelRatio={isFullscreenMode ? Math.max(window.devicePixelRatio || 2, 3) : 1}
        imageSmoothingEnabled={true}
        style={{
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(0,0,0,0.15)',
        }}
        ref={stageRef}
        onClick={(e) => {
          const clickedStage = e.target === e.target.getStage();
          
          if (clickedStage) {
            setSelectedElement(null);
            closeContextMenu();
          }
        }}
      >
        <Layer>
          {/* Background image */}
          {backgroundImage && (
            <KonvaImage
              image={backgroundImage}
              x={0}
              y={0}
              width={1024}
              height={576}
              listening={false}
            />
          )}
          {/* Background gradient (only if no background image) */}
          {!backgroundImage && slide?.backgroundGradient && (
            <GradientBackground
              width={1024}
              height={576}
              type={slide.backgroundGradient.type || 'linear'}
              colors={slide.backgroundGradient.colors || ['#ffffff']}
            />
          )}
          {/* Background color (only if no background image or gradient) */}
          {!backgroundImage && !slide?.backgroundGradient && slide?.backgroundColor && (
            <Rect
              x={0}
              y={0}
              width={1024}
              height={576}
              fill={slide.backgroundColor}
              listening={false}
            />
          )}
          {/* Default white background if no background color, gradient, or image */}
          {!backgroundImage && !slide?.backgroundGradient && !slide?.backgroundColor && (
            <Rect
              x={0}
              y={0}
              width={1024}
              height={576}
              fill="white"
              listening={false}
            />
          )}
          {renderElements()}
        </Layer>
      </Stage>
      <ContextMenu
        visible={contextMenu.visible}
        position={contextMenu.position}
        stagePosition={contextMenu.stagePosition}
        onClose={closeContextMenu}
        currentSlide={slide}
        updateSlide={updateSlide}
        onOpenDesignTab={onOpenDesignTab}
        selectedElement={selectedElement}
        deleteElement={deleteElement}
        bringForward={bringForward}
        bringToFront={bringToFront}
        sendBackward={sendBackward}
        sendToBack={sendToBack}
        copiedElement={copiedElement}
        setCopiedElement={setCopiedElement}
        currentSlideIndex={currentSlideIndex}
        duplicateSlide={duplicateSlide}
        addSlideBefore={addSlideBefore}
        addSlideAfter={addSlideAfter}
        currentRightToolbarTab={currentRightToolbarTab}
      />
    </div>
  );
};

export default KonvaCanvas;

