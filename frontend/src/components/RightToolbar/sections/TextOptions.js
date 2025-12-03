import React, { useRef } from 'react';
import { Palette, Trash2 } from 'lucide-react';
import ModernColorPicker from '../shared/ModernColorPicker';
import LayerActions from '../shared/LayerActions';

const TextOptions = ({
  selectedElement,
  updateSlideElement,
  bringForward,
  bringToFront,
  sendBackward,
  sendToBack,
  updateSlide,
  currentSlide,
  deleteElement
}) => {
  const backgroundColorButtonRef = useRef(null);
  const borderColorButtonRef = useRef(null);
  const strokeColorButtonRef = useRef(null);

  // Option Set 1 — Soft Modern Pastels (Text Background)
  const backgroundColors = [
    '#FF6F61', // Soft Coral
    '#F7B32B', // Warm Amber
    '#6CCFF6', // Sky Blue
    '#6E78FF', // Indigo Blue
    '#68D391'  // Fresh Mint
  ];

  // Option Set 2 — Vibrant Neo UI (Stroke colour)
  const strokeColors = [
    '#FF4F81', // Vivid Pink
    '#FFB400', // Vibrant Yellow
    '#00C2FF', // Electric Cyan
    '#4F7CFF', // Bold Blue
    '#00D68F'  // Neon Green
  ];

  // Option Set 3 — Professional Material-UI Inspired (Border colour)
  const borderColors = [
    '#E53935', // Red 600
    '#FB8C00', // Orange 600
    '#43A047', // Green 600
    '#1E88E5', // Blue 600
    '#8E24AA'  // Purple 600
  ];

  // Calculate if a color is light or dark to determine icon color
  const getContrastColor = (color) => {
    if (!color || color === 'transparent' || color === 'undefined') {
      return '#374151'; // Default dark gray
    }
    
    // Convert hex to RGB
    let r, g, b;
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      }
    } else if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        r = parseInt(matches[0]);
        g = parseInt(matches[1]);
        b = parseInt(matches[2]);
      } else {
        return '#374151';
      }
    } else {
      return '#374151';
    }
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className="right-toolbar-section">
      <div className="option-group" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        padding: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* Column 1: Title and Quick Colors */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#404040'
            }}>
              Text Background
            </div>
            {/* Quick Colors - 5 swatches side by side */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              gap: '4px',
              alignItems: 'center'
            }}>
              {backgroundColors.map((color, idx) => (
                <div
                  key={idx}
                  className="color-swatch-small"
                  style={{
                    backgroundColor: color,
                    width: '20px',
                    height: '20px',
                    flexShrink: 0,
                    ...(color === '#ffffff' && { border: '1.5px solid #e5e7eb' })
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateSlideElement(selectedElement.id, { backgroundColor: color });
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          {/* Column 2: Background Color Button and Delete Button */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '36px', height: '36px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <ModernColorPicker
                  value={selectedElement.backgroundColor || '#ffffff'}
                  onColorSelect={(color) => {
                    updateSlideElement(selectedElement.id, { backgroundColor: color });
                  }}
                  defaultColor="#ffffff"
                  compact={true}
                  quickColors={[]}
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
              </div>
              <div 
                ref={backgroundColorButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  const mcpButton = e.currentTarget.parentElement.querySelector('.modern-color-picker > div');
                  if (mcpButton) {
                    if (backgroundColorButtonRef.current) {
                      const rect = backgroundColorButtonRef.current.getBoundingClientRect();
                      mcpButton.setAttribute('data-actual-left', rect.left.toString());
                      mcpButton.setAttribute('data-actual-top', rect.top.toString());
                      mcpButton.setAttribute('data-actual-bottom', rect.bottom.toString());
                      mcpButton.setAttribute('data-actual-width', rect.width.toString());
                    }
                    mcpButton.click();
                  }
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  background: selectedElement.backgroundColor || '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Pick custom color"
              >
                <Palette size={16} style={{ color: getContrastColor(selectedElement.backgroundColor || '#ffffff') }} />
              </div>
            </div>
            <button
              onClick={(e) => {
                if (selectedElement.backgroundColor) {
                  e.stopPropagation();
                  updateSlideElement(selectedElement.id, { backgroundColor: undefined });
                }
              }}
              disabled={!selectedElement.backgroundColor}
              style={{
                width: '36px',
                height: '36px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: selectedElement.backgroundColor ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedElement.backgroundColor ? '#374151' : '#9ca3af',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                opacity: selectedElement.backgroundColor ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (selectedElement.backgroundColor) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }}
              title={selectedElement.backgroundColor ? "Remove background color" : "No background color applied"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Opacity slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', width: '100%', minWidth: 0 }}>
          <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0, whiteSpace: 'nowrap' }}>Opacity</span>
          <input
            type="range"
            onClick={(e) => e.stopPropagation()}
            min="0"
            max="100"
            value={selectedElement.textOpacity !== undefined ? selectedElement.textOpacity * 100 : 100}
            onChange={(e) => {
              e.stopPropagation();
              updateSlideElement(selectedElement.id, { textOpacity: parseFloat(e.target.value) / 100 });
            }}
            onInput={(e) => {
              const value = e.target.value;
              const min = e.target.min || 0;
              const max = e.target.max || 100;
              const percent = ((value - min) / (max - min)) * 100;
              e.target.style.setProperty('--slider-value', `${percent}%`);
            }}
            style={{ 
              flex: 1,
              minWidth: 0,
              height: '4px',
              cursor: 'pointer',
              '--slider-value': `${((selectedElement.textOpacity !== undefined ? selectedElement.textOpacity * 100 : 100) / 100) * 100}%`
            }}
          />
          <div style={{
            flexShrink: 0,
            minWidth: '32px',
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: '600',
            color: '#374151',
            padding: '2px 4px',
            background: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap'
          }}>
            {Math.round((selectedElement.textOpacity !== undefined ? selectedElement.textOpacity * 100 : 100))}%
          </div>
        </div>
      </div>

      <div className="option-group" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        padding: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* Column 1: Title and Quick Colors */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#404040'
            }}>
              Stroke colour
            </div>
            {/* Quick Colors - 5 swatches side by side */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              gap: '4px',
              alignItems: 'center'
            }}>
              {strokeColors.map((color, idx) => (
                <div
                  key={idx}
                  className="color-swatch-small"
                  style={{
                    backgroundColor: color,
                    width: '20px',
                    height: '20px',
                    flexShrink: 0,
                    ...(color === '#ffffff' && { border: '1.5px solid #e5e7eb' })
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateSlideElement(selectedElement.id, { 
                      strokeColor: color, 
                      strokeWidth: (selectedElement.strokeWidth && selectedElement.strokeWidth > 0) ? selectedElement.strokeWidth : 1 
                    });
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          {/* Column 2: Stroke Color Button and Delete Button */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '36px', height: '36px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <ModernColorPicker
                  value={selectedElement.strokeColor || '#000000'}
                  onColorSelect={(color) => {
                    updateSlideElement(selectedElement.id, { 
                      strokeColor: color, 
                      strokeWidth: (selectedElement.strokeWidth && selectedElement.strokeWidth > 0) ? selectedElement.strokeWidth : 1 
                    });
                  }}
                  defaultColor="#000000"
                  compact={true}
                  quickColors={[]}
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
              </div>
              <div 
                ref={strokeColorButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  const mcpButton = e.currentTarget.parentElement.querySelector('.modern-color-picker > div');
                  if (mcpButton) {
                    if (strokeColorButtonRef.current) {
                      const rect = strokeColorButtonRef.current.getBoundingClientRect();
                      mcpButton.setAttribute('data-actual-left', rect.left.toString());
                      mcpButton.setAttribute('data-actual-top', rect.top.toString());
                      mcpButton.setAttribute('data-actual-bottom', rect.bottom.toString());
                      mcpButton.setAttribute('data-actual-width', rect.width.toString());
                    }
                    mcpButton.click();
                  }
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  background: selectedElement.strokeColor || '#000000',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Pick custom color"
              >
                <Palette size={16} style={{ color: getContrastColor(selectedElement.strokeColor || '#000000') }} />
              </div>
            </div>
            <button
              onClick={(e) => {
                if (selectedElement.strokeColor && selectedElement.strokeWidth > 0) {
                  e.stopPropagation();
                  updateSlideElement(selectedElement.id, { strokeColor: undefined, strokeWidth: 0 });
                }
              }}
              disabled={!selectedElement.strokeColor || !selectedElement.strokeWidth || selectedElement.strokeWidth === 0}
              style={{
                width: '36px',
                height: '36px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: (selectedElement.strokeColor && selectedElement.strokeWidth > 0) ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: (selectedElement.strokeColor && selectedElement.strokeWidth > 0) ? '#374151' : '#9ca3af',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                opacity: (selectedElement.strokeColor && selectedElement.strokeWidth > 0) ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (selectedElement.strokeColor && selectedElement.strokeWidth > 0) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }}
              title={(selectedElement.strokeColor && selectedElement.strokeWidth > 0) ? "Remove stroke color" : "No stroke color applied"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Stroke width slider - compact, replacing second row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', width: '100%', minWidth: 0 }}>
          <span style={{ fontSize: '12px', color: (!selectedElement.strokeColor || !selectedElement.strokeWidth || selectedElement.strokeWidth === 0) ? '#9ca3af' : '#6b7280', flexShrink: 0, whiteSpace: 'nowrap', opacity: (!selectedElement.strokeColor || !selectedElement.strokeWidth || selectedElement.strokeWidth === 0) ? 0.5 : 1 }}>Width</span>
          <input
            type="range"
            onClick={(e) => e.stopPropagation()}
            min="0"
            max="10"
            value={selectedElement.strokeWidth || 0}
            disabled={!selectedElement.strokeColor || !selectedElement.strokeWidth || selectedElement.strokeWidth === 0}
            onChange={(e) => {
              if (selectedElement.strokeColor && selectedElement.strokeWidth > 0) {
                e.stopPropagation();
                updateSlideElement(selectedElement.id, { strokeWidth: parseInt(e.target.value) });
              }
            }}
            onInput={(e) => {
              const value = e.target.value;
              const min = e.target.min || 0;
              const max = e.target.max || 10;
              const percent = ((value - min) / (max - min)) * 100;
              e.target.style.setProperty('--slider-value', `${percent}%`);
            }}
            style={{ 
              flex: 1,
              height: '4px',
              cursor: (!selectedElement.strokeColor || !selectedElement.strokeWidth || selectedElement.strokeWidth === 0) ? 'not-allowed' : 'pointer',
              opacity: (!selectedElement.strokeColor || !selectedElement.strokeWidth || selectedElement.strokeWidth === 0) ? 0.5 : 1,
              '--slider-value': `${((selectedElement.strokeWidth || 0) / 10) * 100}%`
            }}
          />
          <div style={{
            minWidth: '28px',
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: '600',
            color: (!selectedElement.strokeColor || !selectedElement.strokeWidth || selectedElement.strokeWidth === 0) ? '#9ca3af' : '#374151',
            padding: '2px 6px',
            background: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (!selectedElement.strokeColor || !selectedElement.strokeWidth || selectedElement.strokeWidth === 0) ? 0.5 : 1
          }}>
            {selectedElement.strokeWidth || 0}px
          </div>
        </div>
      </div>

      <div className="option-group" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        padding: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* Column 1: Title and Quick Colors */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#404040'
            }}>
              Border colour
            </div>
            {/* Quick Colors - 5 swatches side by side */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              gap: '4px',
              alignItems: 'center'
            }}>
              {borderColors.map((color, idx) => (
                <div
                  key={idx}
                  className="color-swatch-small"
                  style={{
                    backgroundColor: color,
                    width: '20px',
                    height: '20px',
                    flexShrink: 0,
                    ...(color === '#ffffff' && { border: '1.5px solid #e5e7eb' })
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateSlideElement(selectedElement.id, { borderColor: color, borderWidth: 4 });
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          {/* Column 2: Border Color Button and Delete Button */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '36px', height: '36px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <ModernColorPicker
                  value={selectedElement.borderColor || '#e5e7eb'}
                  onColorSelect={(color) => {
                    updateSlideElement(selectedElement.id, { borderColor: color, borderWidth: 4 });
                  }}
                  defaultColor="#e5e7eb"
                  compact={true}
                  quickColors={[]}
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
              </div>
              <div 
                ref={borderColorButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  const mcpButton = e.currentTarget.parentElement.querySelector('.modern-color-picker > div');
                  if (mcpButton) {
                    if (borderColorButtonRef.current) {
                      const rect = borderColorButtonRef.current.getBoundingClientRect();
                      mcpButton.setAttribute('data-actual-left', rect.left.toString());
                      mcpButton.setAttribute('data-actual-top', rect.top.toString());
                      mcpButton.setAttribute('data-actual-bottom', rect.bottom.toString());
                      mcpButton.setAttribute('data-actual-width', rect.width.toString());
                    }
                    mcpButton.click();
                  }
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  background: selectedElement.borderColor || '#e5e7eb',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Pick custom color"
              >
                <Palette size={16} style={{ color: getContrastColor(selectedElement.borderColor || '#e5e7eb') }} />
              </div>
            </div>
            <button
              onClick={(e) => {
                if (selectedElement.borderColor && selectedElement.borderWidth > 0) {
                  e.stopPropagation();
                  updateSlideElement(selectedElement.id, { borderColor: undefined, borderWidth: 0 });
                }
              }}
              disabled={!selectedElement.borderColor || !selectedElement.borderWidth || selectedElement.borderWidth === 0}
              style={{
                width: '36px',
                height: '36px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: (selectedElement.borderColor && selectedElement.borderWidth > 0) ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: (selectedElement.borderColor && selectedElement.borderWidth > 0) ? '#374151' : '#9ca3af',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                opacity: (selectedElement.borderColor && selectedElement.borderWidth > 0) ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (selectedElement.borderColor && selectedElement.borderWidth > 0) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }}
              title={(selectedElement.borderColor && selectedElement.borderWidth > 0) ? "Remove border color" : "No border color applied"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Border width slider - compact, replacing second row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', width: '100%', minWidth: 0 }}>
              <span style={{ fontSize: '12px', color: (!selectedElement.borderColor || !selectedElement.borderWidth || selectedElement.borderWidth === 0) ? '#9ca3af' : '#6b7280', flexShrink: 0, whiteSpace: 'nowrap', opacity: (!selectedElement.borderColor || !selectedElement.borderWidth || selectedElement.borderWidth === 0) ? 0.5 : 1 }}>Width</span>
              <input
                type="range"
                onClick={(e) => e.stopPropagation()}
                min="0"
                max="10"
                value={selectedElement.borderWidth || 0}
                disabled={!selectedElement.borderColor || !selectedElement.borderWidth || selectedElement.borderWidth === 0}
                onChange={(e) => {
                  if (selectedElement.borderColor && selectedElement.borderWidth > 0) {
                    e.stopPropagation();
                    updateSlideElement(selectedElement.id, { borderWidth: parseInt(e.target.value) });
                  }
                }}
                onInput={(e) => {
                  const value = e.target.value;
                  const min = e.target.min || 0;
                  const max = e.target.max || 10;
                  const percent = ((value - min) / (max - min)) * 100;
                  e.target.style.setProperty('--slider-value', `${percent}%`);
                }}
                style={{
                  flex: 1,
                  height: '4px',
                  cursor: (!selectedElement.borderColor || !selectedElement.borderWidth || selectedElement.borderWidth === 0) ? 'not-allowed' : 'pointer',
                  opacity: (!selectedElement.borderColor || !selectedElement.borderWidth || selectedElement.borderWidth === 0) ? 0.5 : 1,
                  '--slider-value': `${((selectedElement.borderWidth || 0) / 10) * 100}%`
                }}
              />
          <div style={{
            minWidth: '28px',
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: '600',
            color: (!selectedElement.borderColor || !selectedElement.borderWidth || selectedElement.borderWidth === 0) ? '#9ca3af' : '#374151',
            padding: '2px 6px',
            background: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (!selectedElement.borderColor || !selectedElement.borderWidth || selectedElement.borderWidth === 0) ? 0.5 : 1
          }}>
            {selectedElement.borderWidth || 0}px
          </div>
        </div>
      </div>

      <div className="option-group" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        padding: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
          height: 'auto',
          minHeight: 'auto'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#404040'
          }}>
            Text Styles
          </div>
          {/* Delete button - only show when text style is applied */}
          {(selectedElement.fillLinearGradientColorStops || 
            (selectedElement.shadowColor && selectedElement.shadowBlur > 0) || 
            selectedElement.strokeLinearGradientColorStops ||
            (selectedElement.scaleX !== undefined && selectedElement.scaleX !== 1) ||
            (selectedElement.scaleY !== undefined && selectedElement.scaleY !== 1)) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateSlideElement(selectedElement.id, {
                  fillLinearGradientColorStops: undefined,
                  fillLinearGradientStartPoint: undefined,
                  fillLinearGradientEndPoint: undefined,
                  shadowColor: undefined,
                  shadowBlur: 0,
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  shadowOpacity: 0,
                  strokeLinearGradientColorStops: undefined,
                  strokeLinearGradientStartPoint: undefined,
                  strokeLinearGradientEndPoint: undefined,
                  textOpacity: 1,
                  scaleX: 1,
                  scaleY: 1,
                  color: selectedElement.color || '#000000' // Keep original color or default to black
                });
              }}
              className="text-style-delete-btn"
              style={{
                width: '24px',
                height: '24px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#374151',
                padding: '2px',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }}
              title="Remove text style"
            >
              <Trash2 size={16} style={{ width: '100%', height: '100%', minWidth: '16px', minHeight: '16px' }} />
            </button>
          )}
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '0.5rem'
        }}>
          {/* 1. Mesh Glow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateSlideElement(selectedElement.id, {
                fillLinearGradientStartPoint: { x: -50, y: -50 },
                fillLinearGradientEndPoint: { x: 200, y: 200 },
                fillLinearGradientColorStops: [0, "#ff00cc", 1, "#3333ff"],
                shadowColor: "rgba(0,0,0,0.3)",
                shadowBlur: 15,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowOpacity: 1,
                strokeColor: undefined,
                strokeWidth: 0,
                strokeLinearGradientColorStops: undefined,
                strokeLinearGradientStartPoint: undefined,
                strokeLinearGradientEndPoint: undefined,
                textOpacity: 1,
                scaleX: 1,
                scaleY: 1
              });
            }}
            style={{
              padding: '0',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              aspectRatio: '2/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Mesh Gradient Glow"
          >
            <img 
              src="/images/textoptions/mesh glow.png" 
              alt="Mesh Glow"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                display: 'block'
              }}
            />
          </button>

          {/* 2. Neon Glow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateSlideElement(selectedElement.id, {
                color: "#00eaff",
                shadowColor: "#00eaff",
                shadowBlur: 25,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowOpacity: 1,
                fillLinearGradientColorStops: undefined,
                fillLinearGradientStartPoint: undefined,
                fillLinearGradientEndPoint: undefined,
                strokeColor: undefined,
                strokeWidth: 0,
                strokeLinearGradientColorStops: undefined,
                strokeLinearGradientStartPoint: undefined,
                strokeLinearGradientEndPoint: undefined,
                textOpacity: 1,
                scaleX: 1,
                scaleY: 1
              });
            }}
            style={{
              padding: '0',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              aspectRatio: '2/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Neon Glow (Cyberpunk)"
          >
            <img 
              src="/images/textoptions/neon glow.png" 
              alt="Neon Glow"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                display: 'block'
              }}
            />
          </button>

          {/* 3. Metallic */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const textHeight = selectedElement.height || 50;
              updateSlideElement(selectedElement.id, {
                fillLinearGradientColorStops: [0, "#e0e0e0", 0.5, "#ffffff", 1, "#a0a0a0"],
                fillLinearGradientStartPoint: { x: 0, y: 0 },
                fillLinearGradientEndPoint: { x: 0, y: textHeight },
                shadowColor: "rgba(0,0,0,0.4)",
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowOpacity: 1,
                strokeColor: undefined,
                strokeWidth: 0,
                strokeLinearGradientColorStops: undefined,
                strokeLinearGradientStartPoint: undefined,
                strokeLinearGradientEndPoint: undefined,
                textOpacity: 1,
                scaleX: 1,
                scaleY: 1
              });
            }}
            style={{
              padding: '0',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              aspectRatio: '2/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Metallic Chrome"
          >
            <img 
              src="/images/textoptions/metallic.png" 
              alt="Metallic"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                display: 'block'
              }}
            />
          </button>

          {/* 5. Frosted */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateSlideElement(selectedElement.id, {
                color: "#ffffff",
                textOpacity: 0.6,
                shadowColor: "rgba(255,255,255,0.8)",
                shadowBlur: 15,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowOpacity: 1,
                fillLinearGradientColorStops: undefined,
                fillLinearGradientStartPoint: undefined,
                fillLinearGradientEndPoint: undefined,
                strokeColor: undefined,
                strokeWidth: 0,
                strokeLinearGradientColorStops: undefined,
                strokeLinearGradientStartPoint: undefined,
                strokeLinearGradientEndPoint: undefined,
                scaleX: 1,
                scaleY: 1
              });
            }}
            style={{
              padding: '0',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              aspectRatio: '2/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Frosted Blur (glass-like)"
          >
            <img 
              src="/images/textoptions/frosted.png" 
              alt="Frosted"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                display: 'block'
              }}
            />
          </button>

          {/* 6. Gradient Stroke */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const textWidth = selectedElement.width || 200;
              updateSlideElement(selectedElement.id, {
                strokeLinearGradientColorStops: [0, "#ff7f50", 1, "#6a5acd"],
                strokeLinearGradientStartPoint: { x: 0, y: 0 },
                strokeLinearGradientEndPoint: { x: textWidth, y: 0 },
                strokeWidth: 3,
                strokeColor: undefined,
                color: "transparent",
                fillLinearGradientColorStops: undefined,
                fillLinearGradientStartPoint: undefined,
                fillLinearGradientEndPoint: undefined,
                shadowColor: undefined,
                shadowBlur: 0,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowOpacity: 0,
                textOpacity: 1,
                scaleX: 1,
                scaleY: 1
              });
            }}
            style={{
              padding: '0',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              aspectRatio: '2/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Gradient Stroke Outline"
          >
            <img 
              src="/images/textoptions/gradient stroke.png" 
              alt="Gradient Stroke"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                display: 'block'
              }}
            />
          </button>

          {/* 7. Cyberwave */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateSlideElement(selectedElement.id, {
                color: "#ff00ff",
                shadowColor: "#6600ff",
                shadowBlur: 30,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowOpacity: 1,
                fillLinearGradientColorStops: undefined,
                fillLinearGradientStartPoint: undefined,
                fillLinearGradientEndPoint: undefined,
                strokeColor: undefined,
                strokeWidth: 0,
                strokeLinearGradientColorStops: undefined,
                strokeLinearGradientStartPoint: undefined,
                strokeLinearGradientEndPoint: undefined,
                textOpacity: 1,
                scaleX: 1.1,
                scaleY: 1
              });
            }}
            style={{
              padding: '0',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              aspectRatio: '2/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Retro Cyberwave Glow"
          >
            <img 
              src="/images/textoptions/cyberwave.png" 
              alt="Cyberwave"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                display: 'block'
              }}
            />
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default TextOptions;

