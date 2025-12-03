import React, { useRef, useState, useEffect } from 'react';
import { FiImage } from 'react-icons/fi';
import { Palette, Trash2 } from 'lucide-react';
import ModernColorPicker from '../shared/ModernColorPicker';
import { getGlobalBackground, setGlobalBackground, getToggleState, setToggleState } from '../../../utils/globalBackground';

const DesignSection = ({ updateSlide, currentSlide, slides, updateAllSlides }) => {
  const colorPickerButtonRef = useRef(null);
  // Initialize from global state to persist across remounts
  const [applyToAllSlides, setApplyToAllSlides] = useState(() => getToggleState());
  const prevToggleStateRef = useRef(false);

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

  const backgroundColors = [
    { color: '#ffffff', title: 'White' },
    { color: '#f3f4f6', title: 'Light Gray' },
    { color: '#0ea5e9', title: 'Sky Blue' },
    { color: '#1e293b', title: 'Dark Slate' },
    { color: '#8b5cf6', title: 'Purple' },
    { color: '#10b981', title: 'Emerald' },
    { color: '#f59e0b', title: 'Amber' },
    { color: '#f43f5e', title: 'Rose' },
  ];

  const gradients = [
    {
      id: 'sunset',
      name: 'Sunset',
      type: 'linear',
      colors: ['#ff6b6b', '#ffa500', '#ff4757']
    },
    {
      id: 'ocean',
      name: 'Ocean',
      type: 'linear',
      colors: ['#667eea', '#764ba2']
    },
    {
      id: 'forest',
      name: 'Forest',
      type: 'linear',
      colors: ['#134e5e', '#71b280']
    },
    {
      id: 'lavender',
      name: 'Lavender',
      type: 'linear',
      colors: ['#e0c3fc', '#8ec5fc']
    },
    {
      id: 'peach',
      name: 'Peach',
      type: 'linear',
      colors: ['#ffecd2', '#fcb69f']
    },
    {
      id: 'midnight',
      name: 'Midnight',
      type: 'linear',
      colors: ['#0c0c0c', '#1a1a2e']
    },
    {
      id: 'aurora',
      name: 'Aurora',
      type: 'linear',
      colors: ['#0f2027', '#203a43', '#2c5364', '#0f2027']
    },
    {
      id: 'rose',
      name: 'Rose Gold',
      type: 'linear',
      colors: ['#fbc2eb', '#a6c1ee']
    },
    {
      id: 'tropical',
      name: 'Tropical',
      type: 'linear',
      colors: ['#f093fb', '#f5576c']
    },
    {
      id: 'emerald',
      name: 'Emerald',
      type: 'linear',
      colors: ['#11998e', '#38ef7d']
    },
    {
      id: 'purple',
      name: 'Purple Dream',
      type: 'linear',
      colors: ['#667eea', '#764ba2']
    },
    {
      id: 'cosmic',
      name: 'Cosmic',
      type: 'linear',
      colors: ['#2e1a47', '#8b5cf6', '#1a0d2e']
    },
    {
      id: 'blue-radial',
      name: 'Blue Glow',
      type: 'radial',
      colors: ['#3a7bd5', '#00d2ff']
    },
    {
      id: 'pink-radial',
      name: 'Pink Glow',
      type: 'radial',
      colors: ['#ff9a9e', '#fad0c4']
    },
    {
      id: 'sky',
      name: 'Sky',
      type: 'linear',
      colors: ['#a1c4fd', '#c2e9fb', '#ffffff']
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      type: 'linear',
      colors: ['#232526', '#414345']
    },
    {
      id: 'blue-red',
      name: 'Blue to Red',
      type: 'linear',
      colors: ['#1565C0', '#b92b27']
    },
    {
      id: 'olive-grey',
      name: 'Olive to Grey',
      type: 'linear',
      colors: ['#757519', '#CCCCB2']
    },
    {
      id: 'gold-cream',
      name: 'Gold to Cream',
      type: 'linear',
      colors: ['#f8b500', '#fceabb']
    },
    {
      id: 'multicolor',
      name: 'Multi-Color',
      type: 'linear',
      colors: ['#FFAF7B', '#D76D77', '#3A1C71']
    }
  ];

  // Sync toggle state with global state whenever it changes
  useEffect(() => {
    const toggleJustTurnedOn = applyToAllSlides && !prevToggleStateRef.current;
    const toggleJustTurnedOff = !applyToAllSlides && prevToggleStateRef.current;
    
    // Update global toggle state
    setToggleState(applyToAllSlides);
    
    if (toggleJustTurnedOn && currentSlide) {
      // Toggle just turned on - store current slide's background and apply to all if it exists
      const background = {
        backgroundColor: currentSlide.backgroundColor,
        backgroundGradient: currentSlide.backgroundGradient,
        backgroundImage: currentSlide.backgroundImage,
        backgroundSize: currentSlide.backgroundSize,
        backgroundPosition: currentSlide.backgroundPosition,
        backgroundRepeat: currentSlide.backgroundRepeat
      };
      setGlobalBackground({
        isActive: true,
        background
      });
      // If there's a background on current slide, apply it to all slides
      if (currentSlide.backgroundColor || currentSlide.backgroundGradient || currentSlide.backgroundImage) {
        if (updateAllSlides) {
          updateAllSlides(background);
        }
      }
    } else if (toggleJustTurnedOff) {
      // Toggle just turned off - clear global background state
      setGlobalBackground({
        isActive: false,
        background: null
      });
    } else if (applyToAllSlides) {
      // Toggle is on - just ensure global state reflects current toggle state
      // Don't update background based on currentSlide changes to avoid unwanted updates
      const bgState = getGlobalBackground();
      if (!bgState.isActive) {
        // If for some reason isActive is false but toggle is on, restore it
        if (currentSlide) {
          const background = {
            backgroundColor: currentSlide.backgroundColor,
            backgroundGradient: currentSlide.backgroundGradient,
            backgroundImage: currentSlide.backgroundImage,
            backgroundSize: currentSlide.backgroundSize,
            backgroundPosition: currentSlide.backgroundPosition,
            backgroundRepeat: currentSlide.backgroundRepeat
          };
          setGlobalBackground({
            isActive: true,
            background
          });
        }
      }
    }
    
    prevToggleStateRef.current = applyToAllSlides;
  }, [applyToAllSlides, currentSlide, updateAllSlides]);

  const applyBackgroundToAll = (updates) => {
    if (applyToAllSlides && updateAllSlides) {
      // Store the background for new slides
      setGlobalBackground({
        isActive: true,
        background: updates
      });
      // Apply to all existing slides
      updateAllSlides(updates);
    } else if (updateSlide) {
      // Apply only to current slide
      updateSlide(updates);
    }
  };

  const applyBackgroundColor = (color) => {
    const updates = {
      backgroundColor: color,
      backgroundGradient: undefined,
      backgroundImage: null,
      backgroundSize: null,
      backgroundPosition: null,
      backgroundRepeat: null
    };
    applyBackgroundToAll(updates);
  };

  const applyGradient = (gradient) => {
    const updates = {
      backgroundGradient: {
        type: gradient.type,
        colors: gradient.colors
      },
      backgroundColor: undefined,
      backgroundImage: null,
      backgroundSize: null,
      backgroundPosition: null,
      backgroundRepeat: null
    };
    applyBackgroundToAll(updates);
  };

  const handleImageUpload = (e) => {
    e.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const updates = { 
          backgroundImage: ev.target.result,
          backgroundGradient: undefined,
          backgroundColor: undefined
        };
        applyBackgroundToAll(updates);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const clearBackground = (e) => {
    e.stopPropagation();
    const updates = {
      backgroundColor: undefined,
      backgroundGradient: undefined,
      backgroundImage: null,
      backgroundSize: null,
      backgroundPosition: null,
      backgroundRepeat: null
    };
    applyBackgroundToAll(updates);
  };

  return (
    <div className="right-toolbar-section">
      <div className="option-group">
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Gradients
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {gradients.map((gradient) => {
              const gradientStyle = gradient.type === 'linear'
                ? `linear-gradient(135deg, ${gradient.colors.join(', ')})`
                : `radial-gradient(circle, ${gradient.colors.join(', ')})`;
              
              const isSelected = currentSlide?.backgroundGradient?.type === gradient.type && 
                JSON.stringify(currentSlide?.backgroundGradient?.colors) === JSON.stringify(gradient.colors);
              
              return (
                <div
                  key={gradient.id}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    background: gradientStyle,
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #000000' : '1px solid #e5e7eb',
                    boxShadow: isSelected 
                      ? '0 0 0 2px rgba(0, 0, 0, 0.1)' 
                      : '0 1px 2px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    applyGradient(gradient);
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }
                  }}
                  title={gradient.name}
                />
              );
            })}
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Solid Colors
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Quick Colors Grid */}
            <div className="quick-colors-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {backgroundColors.map(({ color, title }) => (
                <div
                  key={color}
                  className="color-swatch-small"
                  style={{
                    backgroundColor: color,
                    ...(color === '#ffffff' && { border: '1.5px solid #e5e7eb' })
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    applyBackgroundColor(color);
                  }}
                  title={title}
                />
              ))}
            </div>

            {/* Color Picker, Image Upload, and Delete */}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '36px', height: '36px' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <ModernColorPicker
                  value={currentSlide?.backgroundColor || '#ffffff'}
                  onColorSelect={(color) => {
                    applyBackgroundColor(color);
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
                  ref={colorPickerButtonRef}
                  data-design-section-color-picker="true"
                onClick={(e) => {
                  e.stopPropagation();
                  // Trigger the hidden ModernColorPicker button
                  const mcpButton = e.currentTarget.parentElement.querySelector('.modern-color-picker > div');
                  if (mcpButton) {
                    // Update position before triggering
                    if (colorPickerButtonRef.current) {
                      const rect = colorPickerButtonRef.current.getBoundingClientRect();
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
                  background: currentSlide?.backgroundColor || '#ffffff',
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
                  <Palette size={16} style={{ color: getContrastColor(currentSlide?.backgroundColor || '#ffffff') }} />
                </div>
              </div>
              <button
                onClick={handleImageUpload}
                style={{
                  width: '36px',
                  height: '36px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#374151',
                  fontSize: '16px',
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
                title="Upload background image"
              >
                <FiImage />
              </button>
              <button
                onClick={clearBackground}
                style={{
                  width: '36px',
                  height: '36px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#374151',
                  fontSize: '16px',
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
                title="Remove background"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSection;

