import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { Palette, Pipette } from "lucide-react";
import "./ModernColorPicker.css";

const DEFAULT_QUICK_COLORS = [
  "#FF5733", "#33FF57", "#3357FF",
  "#F1C40F", "#8E44AD", "#2ECC71",
  "#E74C3C", "#1ABC9C", "#34495E",
];

export default function ModernColorPicker({
  value,
  onColorSelect,
  defaultColor = "#FFFFFF",
  label = "Color",
  quickColors = DEFAULT_QUICK_COLORS,
  compact = false,
  buttonSize = "20px",
  buttonStyle = {},
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [color, setColor] = useState(value || defaultColor);
  const [popupStyle, setPopupStyle] = useState({});
  const pickerTimeout = useRef(null);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  // Update local color when value prop changes
  useEffect(() => {
    setColor(value || defaultColor);
  }, [value, defaultColor]);

  // Smart positioning calculation
  const updatePopupPosition = () => {
    const triggerElement = buttonRef.current || pickerRef.current?.querySelector('.mcp-custom-btn');
    if (!triggerElement) return;

    // Check if data attributes are set (for external button positioning)
    const hasDataAttrs = triggerElement.hasAttribute('data-actual-left');
    let rect;
    
    if (hasDataAttrs) {
      // Use data attributes for positioning (when button is hidden but we have external button)
      rect = {
        left: parseFloat(triggerElement.getAttribute('data-actual-left')) || 0,
        top: parseFloat(triggerElement.getAttribute('data-actual-top')) || 0,
        bottom: parseFloat(triggerElement.getAttribute('data-actual-bottom')) || 0,
        width: parseFloat(triggerElement.getAttribute('data-actual-width')) || 0
      };
    } else {
      // Use getBoundingClientRect for normal positioning
      rect = triggerElement.getBoundingClientRect();
    }

    const pickerWidth = 220; // 200px picker + 20px padding
    const pickerHeight = 220; // 200px picker + 20px padding
    const padding = 8;

    let top, left;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Vertical positioning: open below or above
    if (rect.bottom + pickerHeight + padding < viewportHeight) {
      top = rect.bottom + padding; // Open below
    } else if (rect.top - pickerHeight - padding > 0) {
      top = rect.top - pickerHeight - padding; // Open above
    } else {
      // If neither fits, prefer below but constrain to viewport
      top = Math.max(padding, Math.min(rect.bottom + padding, viewportHeight - pickerHeight - padding));
    }

    // Horizontal positioning: align left or shift right if near edge
    if (rect.left + pickerWidth > viewportWidth) {
      left = Math.max(padding, viewportWidth - pickerWidth - padding); // Shift left to fit
    } else {
      left = Math.max(padding, rect.left); // Align to left edge of trigger
    }

    setPopupStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 999999,
    });
  };

  // Update position when picker opens and on resize/scroll
  useEffect(() => {
    if (showPicker) {
      updatePopupPosition();
      window.addEventListener("resize", updatePopupPosition);
      window.addEventListener("scroll", updatePopupPosition, true);
    }
    return () => {
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
    };
  }, [showPicker]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on the popup itself
      const popup = document.querySelector('.mcp-picker-popup');
      const triggerElement = buttonRef.current || pickerRef.current?.querySelector('.mcp-custom-btn');
      
      // If click is on trigger element, don't close (toggle handled by onClick)
      if (triggerElement && triggerElement.contains(event.target)) {
        return;
      }
      
      // If click is on popup, don't close
      if (popup && popup.contains(event.target)) {
        return;
      }
      
      // Otherwise, close the picker
      setShowPicker(false);
    };

    if (showPicker) {
      // Use capture phase to catch clicks before they bubble
      document.addEventListener("mousedown", handleClickOutside, true);
      return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }
  }, [showPicker]);

  const handleChangeComplete = (newColor) => {
    // Clear any pending timeout
    if (pickerTimeout.current) {
      clearTimeout(pickerTimeout.current);
    }
    
    // Update local state immediately for visual feedback
    setColor(newColor);
    
    // Debounce the actual update to parent
    pickerTimeout.current = setTimeout(() => {
      onColorSelect(newColor);
    }, 250);
  };

  const handleQuickColorClick = (quickColor) => {
    // Clear any pending timeout
    if (pickerTimeout.current) {
      clearTimeout(pickerTimeout.current);
    }
    
    setColor(quickColor);
    onColorSelect(quickColor);
  };

  const openEyeDropper = async () => {
    if (!window.EyeDropper) {
      alert("Your browser doesn't support the EyeDropper API. Use Chrome or Edge.");
      return;
    }

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();

      if (result?.sRGBHex) {
        setColor(result.sRGBHex);
        onColorSelect(result.sRGBHex);
      }
    } catch (err) {
      // User cancelled or error occurred - silently handle
      console.log("Eyedropper cancelled:", err);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pickerTimeout.current) {
        clearTimeout(pickerTimeout.current);
      }
    };
  }, []);

  // Compact mode: just a button that shows the color picker popup
  if (compact) {
    // Extract backgroundColor from buttonStyle if provided, otherwise use color
    const { backgroundColor: buttonBgColor, ...restButtonStyle } = buttonStyle;
    const displayColor = buttonBgColor !== undefined ? buttonBgColor : (color || 'transparent');
    
    return (
      <div className="modern-color-picker" ref={pickerRef} style={{ position: 'relative', display: 'inline-block' }}>
        <div
          ref={buttonRef}
          style={{
            width: buttonSize,
            height: buttonSize,
            backgroundColor: displayColor,
            cursor: 'pointer',
            position: 'relative',
            borderRadius: '4px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            ...restButtonStyle,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker((s) => !s);
          }}
          title="Pick color"
        />
        {showPicker && createPortal(
          <div className="mcp-picker-popup" style={popupStyle}>
            <div className="mcp-picker-wrapper">
              <HexColorPicker color={color || defaultColor} onChange={handleChangeComplete} />
              <button
                className="mcp-dropper-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  openEyeDropper();
                }}
                title="Pick color from screen"
              >
                <Pipette size={12} />
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // Full mode: with quick colors and header
  return (
    <div className="modern-color-picker" ref={pickerRef}>
      {label && (
        <div className="mcp-header">
          <Palette size={16} />
          <span>{label}</span>
        </div>
      )}

      <div className="mcp-swatches">
        {quickColors.map((c) => (
          <div
            key={c}
            className={`mcp-swatch ${color === c ? 'active' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => handleQuickColorClick(c)}
            title={c}
          />
        ))}
        <button
          ref={buttonRef}
          className="mcp-custom-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker((s) => !s);
          }}
          title="Custom color"
        >
          🎨
        </button>
      </div>

      {showPicker && createPortal(
        <div className="mcp-picker-popup" style={popupStyle}>
          <div className="mcp-picker-wrapper">
            <HexColorPicker color={color} onChange={handleChangeComplete} />
            <button
              className="mcp-dropper-btn"
              onClick={(e) => {
                e.stopPropagation();
                openEyeDropper();
              }}
              title="Pick color from screen"
            >
              <Pipette size={12} />
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

