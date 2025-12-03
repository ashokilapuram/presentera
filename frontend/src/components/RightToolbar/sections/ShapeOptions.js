import React, { useRef } from 'react';
import { Palette, Trash2 } from 'lucide-react';
import ModernColorPicker from '../shared/ModernColorPicker';
import LayerActions from '../shared/LayerActions';

const ShapeOptions = ({
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
  const borderColorButtonRef = useRef(null);
  const fillColorButtonRef = useRef(null);

  const fillColors = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
    '#f43f5e', '#06b6d4', '#84cc16', '#a855f7',
    '#f97316', '#0ea5e9', '#64748b', '#ef4444',
    '#ec4899', '#6366f1'
  ];

  const borderColors = [
    '#000000', '#6b7280', '#0ea5e9', '#8b5cf6',
    '#10b981', '#f59e0b', '#f43f5e', '#06b6d4',
    '#84cc16', '#a855f7', '#f97316', '#e5e7eb'
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

  // Convert hex to rgba with opacity
  const hexToRgba = (hex, opacity = 1) => {
    if (!hex || hex === 'transparent') return `rgba(0, 0, 0, ${opacity})`;
    
    let r, g, b;
    if (hex.startsWith('#')) {
      const colorHex = hex.slice(1);
      if (colorHex.length === 3) {
        r = parseInt(colorHex[0] + colorHex[0], 16);
        g = parseInt(colorHex[1] + colorHex[1], 16);
        b = parseInt(colorHex[2] + colorHex[2], 16);
      } else {
        r = parseInt(colorHex.slice(0, 2), 16);
        g = parseInt(colorHex.slice(2, 4), 16);
        b = parseInt(colorHex.slice(4, 6), 16);
      }
    } else if (hex.startsWith('rgba')) {
      // If already rgba, extract rgb and use new opacity
      const matches = hex.match(/\d+\.?\d*/g);
      if (matches && matches.length >= 3) {
        r = parseInt(matches[0]);
        g = parseInt(matches[1]);
        b = parseInt(matches[2]);
      } else {
        return hex;
      }
    } else if (hex.startsWith('rgb')) {
      const matches = hex.match(/\d+/g);
      if (matches && matches.length >= 3) {
        r = parseInt(matches[0]);
        g = parseInt(matches[1]);
        b = parseInt(matches[2]);
      } else {
        return hex;
      }
    } else {
      return hex;
    }
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Get fill color with opacity applied for preview
  const getFillColorWithOpacity = () => {
    const fillColor = selectedElement.fillColor || '#3b82f6';
    const opacity = selectedElement.fillOpacity !== undefined ? selectedElement.fillOpacity : 1;
    return opacity < 1 ? hexToRgba(fillColor, opacity) : fillColor;
  };

  return (
    <div className="right-toolbar-section">
      <div className="option-group" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        padding: '0.75rem'
      }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#404040',
          marginBottom: '0.25rem'
        }}>
          Fill color & opacity
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
          {/* Quick Colors Grid - 2 rows */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '4px',
            flex: 1
          }}>
            {fillColors.map((color, idx) => (
              <div
                key={idx}
                className="color-swatch-small"
                style={{
                  backgroundColor: color,
                  ...(color === '#ffffff' && { border: '1.5px solid #e5e7eb' })
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  updateSlideElement(selectedElement.id, { fillColor: color });
                }}
                title={color}
              />
            ))}
          </div>
          
          {/* Fill Color Button */}
          <div style={{ position: 'relative', width: '36px', height: '36px' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              <ModernColorPicker
                value={selectedElement.fillColor || '#3b82f6'}
                onColorSelect={(color) => {
                  updateSlideElement(selectedElement.id, { fillColor: color });
                }}
                defaultColor="#3b82f6"
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
              ref={fillColorButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                const mcpButton = e.currentTarget.parentElement.querySelector('.modern-color-picker > div');
                if (mcpButton) {
                  if (fillColorButtonRef.current) {
                    const rect = fillColorButtonRef.current.getBoundingClientRect();
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
                background: getFillColorWithOpacity(),
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
              <Palette size={16} style={{ color: getContrastColor(selectedElement.fillColor || '#3b82f6') }} />
            </div>
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
            value={(selectedElement.fillOpacity !== undefined ? selectedElement.fillOpacity : 1) * 100}
            onChange={(e) => {
              e.stopPropagation();
              const opacityValue = parseInt(e.target.value) / 100;
              updateSlideElement(selectedElement.id, { fillOpacity: opacityValue });
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
              '--slider-value': `${((selectedElement.fillOpacity !== undefined ? selectedElement.fillOpacity : 1) * 100)}%`
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
            {Math.round((selectedElement.fillOpacity !== undefined ? selectedElement.fillOpacity : 1) * 100)}%
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
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#404040',
          marginBottom: '0.25rem'
        }}>
          Border color & width
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
          {/* Quick Colors Grid - 2 rows */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: '4px',
            flex: 1
          }}>
            {borderColors.map((color, idx) => (
              <div
                key={idx}
                className="color-swatch-small"
                style={{
                  backgroundColor: color,
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
          
          {/* Border Color Button and Delete Button */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '6px' }}>
            <div style={{ position: 'relative', width: '36px', height: '36px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <ModernColorPicker
                  value={selectedElement.borderColor || '#1e40af'}
                  onColorSelect={(color) => {
                    updateSlideElement(selectedElement.id, { borderColor: color, borderWidth: 4 });
                  }}
                  defaultColor="#1e40af"
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
                  background: selectedElement.borderColor || '#1e40af',
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
                <Palette size={16} style={{ color: getContrastColor(selectedElement.borderColor || '#1e40af') }} />
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

            {/* Border width slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
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

      {/* Corner Radius - Only show for square and rectangle shapes */}
      {(selectedElement.shapeType === 'square' || selectedElement.shapeType === 'rectangle') && (
        <>
          <div className="option-group" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem',
            padding: '0.75rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#404040',
              marginBottom: '0.25rem'
            }}>
              Corner radius
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <input
                type="range"
                onClick={(e) => e.stopPropagation()}
                min="0"
                max="50"
                value={selectedElement.cornerRadius !== undefined ? selectedElement.cornerRadius : 4}
                onChange={(e) => {
                  e.stopPropagation();
                  updateSlideElement(selectedElement.id, { cornerRadius: parseInt(e.target.value) });
                }}
                onInput={(e) => {
                  const value = e.target.value;
                  const min = e.target.min || 0;
                  const max = e.target.max || 50;
                  const percent = ((value - min) / (max - min)) * 100;
                  e.target.style.setProperty('--slider-value', `${percent}%`);
                }}
                style={{
                  flex: 1,
                  height: '4px',
                  cursor: 'pointer',
                  '--slider-value': `${((selectedElement.cornerRadius !== undefined ? selectedElement.cornerRadius : 4) / 50) * 100}%`
                }}
              />
              <div style={{
                minWidth: '28px',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: '600',
                color: '#374151',
                padding: '2px 6px',
                background: '#ffffff',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selectedElement.cornerRadius !== undefined ? selectedElement.cornerRadius : 4}px
              </div>
            </div>
          </div>
        </>
      )}

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

export default ShapeOptions;

