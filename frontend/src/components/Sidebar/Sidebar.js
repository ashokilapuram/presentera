import React, { useState } from 'react';
import { FiPlus, FiLayout, FiCopy } from 'react-icons/fi';
import { Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './Sidebar.css';

const Sidebar = ({ 
  slides, 
  currentSlideIndex, 
  setCurrentSlideIndex, 
  addSlide, 
  deleteSlide,
  onShowTemplates,
  onReorderSlides,
  onDuplicateSlide,
  setSlides,
  onSlideClick
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleSlideClick = (slideId) => {
    // Derive the index from the id at this moment to avoid stale index issues
    const idx = slides.findIndex(s => s.id === slideId);
    if (idx !== -1) {
      setCurrentSlideIndex(idx);
      // Call the parent handler to deselect element and switch to Insert tab
      if (onSlideClick) {
        onSlideClick();
      }
    }
  };

  const handleDeleteSlide = (e, index) => {
    e.stopPropagation();
    if (slides.length === 1) {
      // If only one slide, create a fresh empty slide instead of deleting
      const freshSlide = {
        id: uuidv4(),
        elements: []
      };
      setSlides([freshSlide]);
      setCurrentSlideIndex(0);
    } else {
      // If multiple slides, delete the slide normally
      deleteSlide(index);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);

    // Auto-scroll behavior
    const sidebarContent = e.currentTarget.closest('.sidebar-content');
    if (sidebarContent) {
      const rect = sidebarContent.getBoundingClientRect();
      const scrollSpeed = 8; // adjust speed if needed

      // Scroll up if cursor near top
      if (e.clientY < rect.top + 50) {
        sidebarContent.scrollTop -= scrollSpeed;
      }
      // Scroll down if cursor near bottom
      else if (e.clientY > rect.bottom - 50) {
        sidebarContent.scrollTop += scrollSpeed;
      }
    }
  };

  const handleDragLeave = (e) => {
    // Only clear dragOverIndex if we're leaving the slide item entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorderSlides(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="new-slide-button" onClick={addSlide}>
          <FiPlus size={16} />
          New Slide
        </button>
        <button className="templates-button" onClick={onShowTemplates}>
          <FiLayout size={16} />
          Templates
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="slides-section">
          <div className="slides-list">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slide-item ${index === currentSlideIndex ? 'active' : ''} ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                onClick={() => handleSlideClick(slide.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* Top row: slide number, delete, duplicate - all side by side */}
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0',
                    margin: '0 0 4px 0',
                    gap: '4px',
                    flexWrap: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  <div 
                    className="slide-number"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      textAlign: 'left',
                      minWidth: '20px',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                      marginLeft: 'auto',
                    }}
                  >
                    <button
                      className="slide-delete"
                      draggable="false"
                      onClick={(e) => handleDeleteSlide(e, index)}
                      title={slides.length === 1 ? "Reset slide" : "Delete slide"}
                      style={{
                        width: '18px',
                        height: '18px',
                        minWidth: '18px',
                        borderRadius: '3px',
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0',
                        margin: '0',
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={10} />
                    </button>
                    <button
                      className="slide-duplicate-btn"
                      draggable="false"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateSlide(index);
                      }}
                      title="Duplicate slide"
                      style={{
                        width: '18px',
                        height: '18px',
                        minWidth: '18px',
                        borderRadius: '3px',
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0',
                        margin: '0',
                        flexShrink: 0,
                      }}
                    >
                      <FiCopy size={10} />
                    </button>
                  </div>
                </div>
                
                {/* Thumbnail */}
                <div 
                  className="slide-thumbnail"
                  style={{
                    backgroundColor: slide.backgroundColor || '#ffffff',
                    backgroundImage: slide.backgroundImage 
                      ? `url(${slide.backgroundImage})` 
                      : slide.backgroundGradient
                        ? slide.backgroundGradient.type === 'radial'
                          ? `radial-gradient(circle, ${slide.backgroundGradient.colors.join(', ')})`
                          : `linear-gradient(135deg, ${slide.backgroundGradient.colors.join(', ')})`
                        : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    height: 'auto',
                  }}
                >
                  {slide.thumbnail ? (
                    <img
                      src={slide.thumbnail}
                      alt={`Slide ${index + 1}`}
                      draggable="false"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1,
                      }}
                    />
                  ) : (
                    <div 
                      draggable="false"
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        boxSizing: 'border-box',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Preview of slide elements */}
                      {slide.elements && slide.elements.length > 0 ? (
                        slide.elements.slice(0, 3).map((element, elIndex) => {
                          const scale = 0.12; // Scale down for thumbnail (adjusted for 16:9 ratio)
                          const scaledX = (element.x || 0) * scale;
                          const scaledY = (element.y || 0) * scale;
                          const scaledWidth = (element.width || 100) * scale;
                          const scaledHeight = (element.height || 20) * scale;
                          
                          if (element.type === 'text') {
                            return (
                              <div
                                key={elIndex}
                                draggable="false"
                                style={{
                                  position: 'absolute',
                                  left: scaledX,
                                  top: scaledY,
                                  width: scaledWidth,
                                  height: scaledHeight,
                                  fontSize: Math.max(8, (element.fontSize || 16) * scale),
                                  fontWeight: element.fontWeight || 'normal',
                                  fontStyle: element.fontStyle || 'normal',
                                  color: element.color || '#000',
                                  textAlign: element.textAlign || 'left',
                                  backgroundColor: element.backgroundColor || 'transparent',
                                  border: element.borderWidth > 0 ? `${Math.max(1, (element.borderWidth || 0) * scale)}px solid ${element.borderColor || '#000'}` : 'none',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start'
                                }}
                                title={element.content || 'Text'}
                              >
                                {(element.content || 'Text').substring(0, 20)}
                              </div>
                            );
                          }
                          
                          if (element.type === 'shape') {
                            return (
                              <div
                                key={elIndex}
                                draggable="false"
                                style={{
                                  position: 'absolute',
                                  left: scaledX,
                                  top: scaledY,
                                  width: scaledWidth,
                                  height: scaledHeight,
                                  backgroundColor: element.fillColor || '#2d9cdb',
                                  border: `${Math.max(1, (element.borderWidth || 0) * scale)}px solid ${element.borderColor || '#1e7bb8'}`,
                                  borderRadius: element.shapeType === 'circle' ? '50%' : 0,
                                }}
                              />
                            );
                          }
                          
                          if (element.type === 'image') {
                            return (
                              <div
                                key={elIndex}
                                draggable="false"
                                style={{
                                  position: 'absolute',
                                  left: scaledX,
                                  top: scaledY,
                                  width: scaledWidth,
                                  height: scaledHeight,
                                  backgroundColor: '#f0f0f0',
                                  border: '1px solid #ddd',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '6px',
                                  color: '#666'
                                }}
                              >
                                📷
                              </div>
                            );
                          }
                          
                          if (element.type === 'chart') {
                            return (
                              <div
                                key={elIndex}
                                draggable="false"
                                style={{
                                  position: 'absolute',
                                  left: scaledX,
                                  top: scaledY,
                                  width: scaledWidth,
                                  height: scaledHeight,
                                  backgroundColor: '#fff',
                                  border: '1px solid #ddd',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '6px',
                                  color: '#666'
                                }}
                              >
                                📊
                              </div>
                            );
                          }
                          
                          return null;
                        })
                      ) : (
                        <div 
                          draggable="false"
                          style={{ 
                            fontSize: '8px', 
                            color: '#999', 
                            textAlign: 'center',
                            opacity: 0.7
                          }}
                        >
                          Empty Slide
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;


