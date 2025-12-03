import React, { useRef, useEffect } from 'react';
import ModernColorPicker from '../../RightToolbar/shared/ModernColorPicker';

/**
 * Color picker button component with ModernColorPicker
 */
const ColorPickerButton = ({ 
  selectedElement, 
  textFormatting, 
  onColorChange, 
  onColorButtonClick 
}) => {
  const currentColor = selectedElement?.color || textFormatting.color || '#000000';
  const buttonRef = useRef(null);
  const mcpContainerRef = useRef(null);
  
  const handleColorSelect = (color) => {
    // Create synthetic event to match old interface
    const syntheticEvent = {
      target: { value: color },
      stopPropagation: () => {},
      preventDefault: () => {}
    };
    onColorChange(syntheticEvent);
  };

  // Sync the ModernColorPicker's buttonRef with our actual button
  useEffect(() => {
    if (buttonRef.current && mcpContainerRef.current) {
      const mcpButton = mcpContainerRef.current.querySelector('.modern-color-picker > div');
      if (mcpButton && buttonRef.current) {
        // Copy the actual button's position to the hidden button for positioning
        const updatePosition = () => {
          if (mcpButton && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Store position data on the hidden button for ModernColorPicker to use
            mcpButton.setAttribute('data-actual-left', rect.left);
            mcpButton.setAttribute('data-actual-top', rect.top);
            mcpButton.setAttribute('data-actual-bottom', rect.bottom);
            mcpButton.setAttribute('data-actual-width', rect.width);
          }
        };
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
          window.removeEventListener('resize', updatePosition);
          window.removeEventListener('scroll', updatePosition, true);
        };
      }
    }
  }, []);

  return (
    <div className="color-button-container" ref={mcpContainerRef}>
      {/* Hidden ModernColorPicker - button is hidden, we use our own button */}
      <ModernColorPicker
        value={currentColor}
        onColorSelect={handleColorSelect}
        defaultColor="#000000"
        compact={true}
        buttonSize="0px"
        buttonStyle={{
          display: 'none',
          opacity: 0,
          position: 'absolute',
          pointerEvents: 'none',
          width: 0,
          height: 0
        }}
      />
      {/* Original button that triggers the color picker */}
      <button 
        ref={buttonRef}
        className="font-color-btn" 
        onClick={(e) => {
          e.stopPropagation();
          onColorButtonClick(e);
          // Update position before triggering - use setTimeout to ensure DOM is ready
          setTimeout(() => {
            if (buttonRef.current) {
              const rect = buttonRef.current.getBoundingClientRect();
              const mcpButton = mcpContainerRef.current?.querySelector('.modern-color-picker > div');
              if (mcpButton) {
                mcpButton.setAttribute('data-actual-left', rect.left.toString());
                mcpButton.setAttribute('data-actual-top', rect.top.toString());
                mcpButton.setAttribute('data-actual-bottom', rect.bottom.toString());
                mcpButton.setAttribute('data-actual-width', rect.width.toString());
                // Trigger the hidden ModernColorPicker button after setting position
                mcpButton.click();
              }
            }
          }, 0);
        }}
      >
        <span className="font-color-btn__label">A</span>
        <span className="font-color-btn__swatch" style={{ backgroundColor: currentColor }}></span>
      </button>
    </div>
  );
};

export default ColorPickerButton;

