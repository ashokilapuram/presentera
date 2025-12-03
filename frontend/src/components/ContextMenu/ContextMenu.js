import React, { useEffect, useRef, useState } from 'react';
import { FiLayers } from 'react-icons/fi';
import { 
  Trash2, 
  Copy,
  Clipboard,
  ArrowUpFromLine,
  ArrowUpNarrowWide,
  ArrowDownFromLine,
  ArrowDownNarrowWide,
  Plus,
  ChevronRight,
  Palette,
  MoveUp,
  MoveDown,
  Settings2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './ContextMenu.css';

const ContextMenu = ({ 
  visible, 
  position,
  stagePosition,
  onClose, 
  currentSlide, 
  updateSlide,
  onOpenDesignTab,
  selectedElement,
  deleteElement,
  bringForward,
  bringToFront,
  sendBackward,
  sendToBack,
  copiedElement,
  setCopiedElement,
  currentSlideIndex,
  duplicateSlide,
  addSlideBefore,
  addSlideAfter,
  currentRightToolbarTab
}) => {
  const menuRef = useRef(null);
  const addSlideRef = useRef(null);
  const submenuRef = useRef(null);
  const backgroundRef = useRef(null);
  const backgroundSubmenuRef = useRef(null);
  const [showAddSlideOptions, setShowAddSlideOptions] = useState(false);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
  const hideTimeoutRef = useRef(null);
  const backgroundHideTimeoutRef = useRef(null);

  // Cleanup timeout on unmount or when menu closes
  useEffect(() => {
    if (!visible) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (backgroundHideTimeoutRef.current) {
        clearTimeout(backgroundHideTimeoutRef.current);
        backgroundHideTimeoutRef.current = null;
      }
      setShowAddSlideOptions(false);
      setShowBackgroundOptions(false);
    }
  }, [visible]);

  // Close menu when clicking outside - works for clicks on toolbar, sidebar, anywhere
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        // Don't close if clicking on color picker dropdown (native browser UI)
        // Check if the target is within a color input or its parent
        let target = e.target;
        let isColorPicker = false;
        
        // Traverse up the DOM tree to check if we're in a color picker
        while (target && target !== document.body) {
          if (target.tagName === 'INPUT' && target.type === 'color') {
            isColorPicker = true;
            break;
          }
          target = target.parentElement;
        }
        
        // Additional check: if color picker is active (has focus), don't close
        const activeColorInput = document.activeElement;
        if (activeColorInput && activeColorInput.type === 'color') {
          isColorPicker = true;
        }
        
        if (!isColorPicker) {
          onClose();
        }
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Use setTimeout to avoid immediate closure on the click that opened the menu
    const timeoutId = setTimeout(() => {
      // Listen to all clicks and context menu clicks anywhere on the page
      // Use capture phase to catch events early
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('click', handleClickOutside, true);
      document.addEventListener('contextmenu', handleClickOutside, true);
      // Also listen to mouseup in case color picker needs it
      document.addEventListener('mouseup', handleClickOutside, true);
    }, 0);

    document.addEventListener('keydown', handleEscape);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('contextmenu', handleClickOutside, true);
      document.removeEventListener('mouseup', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  // Position menu
  useEffect(() => {
    if (!visible || !menuRef.current || !position) return;

    const menu = menuRef.current;
    const { x, y } = position;

    const updatePosition = () => {
      if (!menuRef.current) return;

      // Get canvas container boundaries
      const canvasContainer = document.querySelector('.canvas-container');
      if (!canvasContainer) return;

      const containerRect = canvasContainer.getBoundingClientRect();
      const containerBounds = {
        left: containerRect.left,
        top: containerRect.top,
        right: containerRect.right,
        bottom: containerRect.bottom
      };

      // Get menu dimensions
      const menuRect = menu.getBoundingClientRect();
      const menuWidth = menuRect.width || 200;
      const menuHeight = menuRect.height || 300;

      // Padding from edges
      const padding = 10;

      // Default: position to the right and below cursor
      let left = x;
      let top = y;

      // Check right boundary - flip to left of cursor if needed
      if (x + menuWidth > containerBounds.right - padding) {
        // Position to the left of cursor
        left = x - menuWidth;
        // Ensure it doesn't go outside left boundary
        if (left < containerBounds.left + padding) {
          left = containerBounds.left + padding;
        }
      }

      // Check bottom boundary - flip above cursor if needed
      if (y + menuHeight > containerBounds.bottom - padding) {
        // Position above cursor
        top = y - menuHeight;
        // Ensure it doesn't go outside top boundary
        if (top < containerBounds.top + padding) {
          top = containerBounds.bottom - menuHeight - padding;
        }
      }

      // Final bounds check to ensure menu stays within canvas
      left = Math.max(containerBounds.left + padding, Math.min(left, containerBounds.right - menuWidth - padding));
      top = Math.max(containerBounds.top + padding, Math.min(top, containerBounds.bottom - menuHeight - padding));

      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    };

    // Use requestAnimationFrame to ensure menu is rendered
    requestAnimationFrame(() => {
      updatePosition();
      // Update again after a small delay to handle menu content changes (canvas vs element options)
      setTimeout(updatePosition, 10);
      // Another update to ensure position is correct after menu renders
      setTimeout(updatePosition, 50);
    });

    // Update when submenu appears
    if (showAddSlideOptions || showBackgroundOptions) {
      setTimeout(updatePosition, 50);
    }
  }, [visible, position, showAddSlideOptions, showBackgroundOptions, selectedElement]);

  if (!visible || !position) return null;

  // Handle duplicate slide
  const handleDuplicateSlide = (e) => {
    e.stopPropagation();
    if (duplicateSlide && currentSlideIndex !== undefined) {
      duplicateSlide(currentSlideIndex);
    }
    onClose();
  };

  // Handle add slide before
  const handleAddSlideBefore = (e) => {
    e.stopPropagation();
    if (addSlideBefore) {
      addSlideBefore();
    }
    onClose();
  };

  // Handle add slide after
  const handleAddSlideAfter = (e) => {
    e.stopPropagation();
    if (addSlideAfter) {
      addSlideAfter();
    }
    onClose();
  };

  // Check if any background styling is applied (color, gradient, or image)
  const hasBackgroundStyling = currentSlide && (
    (currentSlide.backgroundColor && 
     currentSlide.backgroundColor !== 'transparent' && 
     currentSlide.backgroundColor !== '') ||
    (currentSlide.backgroundGradient && 
     currentSlide.backgroundGradient.colors && 
     currentSlide.backgroundGradient.colors.length > 0) ||
    (currentSlide.backgroundImage && 
     currentSlide.backgroundImage !== '' && 
     currentSlide.backgroundImage !== null)
  );

  // Handle background click - open design section (only if no background styling exists)
  const handleBackgroundClick = (e) => {
    e.stopPropagation();
    // Only handle direct click if no background styling exists
    if (!hasBackgroundStyling) {
      if (onOpenDesignTab) {
        onOpenDesignTab();
      }
      onClose();
    }
  };

  // Handle background change - open design section
  const handleBackgroundChange = (e) => {
    e.stopPropagation();
    if (onOpenDesignTab) {
      onOpenDesignTab();
    }
    onClose();
  };

  // Handle background delete - remove all background styling
  const handleBackgroundDelete = (e) => {
    e.stopPropagation();
    if (currentSlide && updateSlide) {
      updateSlide({
        backgroundColor: undefined,
        backgroundGradient: undefined,
        backgroundImage: null,
        backgroundSize: null,
        backgroundPosition: null,
        backgroundRepeat: null
      });
    }
    onClose();
  };

  // Handle element copy (to clipboard and internal state)
  const handleCopyElement = (e) => {
    e.stopPropagation();
    if (selectedElement && setCopiedElement) {
      // Store element in state for paste functionality
      setCopiedElement(selectedElement);
      
      // Also copy to system clipboard as JSON for potential external use
      try {
        const elementData = JSON.stringify(selectedElement);
        navigator.clipboard.writeText(elementData).catch(err => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = elementData;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        });
      } catch (err) {
        console.error('Failed to copy element to clipboard:', err);
      }
    }
    onClose();
  };

  // Handle paste element
  const handlePasteElement = (e) => {
    e.stopPropagation();
    if (copiedElement && currentSlide && updateSlide) {
      // Create new element with new ID and position at paste location
      // Use stagePosition if available, otherwise offset from original position
      const pasteX = stagePosition?.x ?? (copiedElement.x || 0) + 20;
      const pasteY = stagePosition?.y ?? (copiedElement.y || 0) + 20;
      
      const newElement = {
        ...copiedElement,
        id: uuidv4(),
        x: pasteX,
        y: pasteY
      };
      const updatedElements = [...(currentSlide.elements || []), newElement];
      updateSlide({ elements: updatedElements });
    }
    onClose();
  };

  // Handle element duplicate
  const handleDuplicateElement = (e) => {
    e.stopPropagation();
    if (selectedElement && currentSlide && updateSlide) {
      const newElement = {
        ...selectedElement,
        id: uuidv4(),
        x: (selectedElement.x || 0) + 20,
        y: (selectedElement.y || 0) + 20
      };
      const updatedElements = [...(currentSlide.elements || []), newElement];
      updateSlide({ elements: updatedElements });
    }
    onClose();
  };

  // Handle element delete
  const handleDeleteElement = (e) => {
    e.stopPropagation();
    if (selectedElement && deleteElement) {
      deleteElement(selectedElement.id);
    }
    onClose();
  };

  // Handle layer actions
  const handleBringForward = (e) => {
    e.stopPropagation();
    if (selectedElement && bringForward) {
      bringForward();
    }
    onClose();
  };

  const handleBringToFront = (e) => {
    e.stopPropagation();
    if (selectedElement && bringToFront) {
      bringToFront();
    }
    onClose();
  };

  const handleSendBackward = (e) => {
    e.stopPropagation();
    if (selectedElement && sendBackward) {
      sendBackward();
    }
    onClose();
  };

  const handleSendToBack = (e) => {
    e.stopPropagation();
    if (selectedElement && sendToBack) {
      sendToBack();
    }
    onClose();
  };

  // Check if layer actions are available (element must exist and have siblings)
  const canMoveForward = selectedElement && currentSlide?.elements && 
    currentSlide.elements.length > 1 && 
    currentSlide.elements.findIndex(el => el.id === selectedElement.id) < currentSlide.elements.length - 1;
  
  const canMoveBackward = selectedElement && currentSlide?.elements && 
    currentSlide.elements.length > 1 && 
    currentSlide.elements.findIndex(el => el.id === selectedElement.id) > 0;

  // Show element options if selectedElement exists, otherwise show background options
  const showElementOptions = selectedElement && selectedElement.id;

  return (
    <div 
      ref={menuRef}
      className="context-menu"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {showElementOptions ? (
        // Element options: Vertical list with white text and black hover
        <div className="context-menu-section element-options-compact">
          <button
            onClick={handleCopyElement}
            className="context-menu-option-item"
            title="Copy"
          >
            <Copy size={16} strokeWidth={2} />
            <span>Copy</span>
          </button>
          <button
            onClick={handleDuplicateElement}
            className="context-menu-option-item"
            title="Duplicate"
          >
            <FiLayers size={16} strokeWidth={2} />
            <span>Duplicate</span>
          </button>
          <button
            onClick={handleDeleteElement}
            className="context-menu-option-item"
            title="Delete"
          >
            <Trash2 size={16} strokeWidth={2} />
            <span>Delete</span>
          </button>
          {/* Only show Layer label if there are active layer options */}
          {(canMoveForward || canMoveBackward) && (
            <>
              <div className="context-menu-layer-label">
                Layer
              </div>
              {canMoveForward && (
                <>
                  <button
                    onClick={handleBringForward}
                    className="context-menu-option-item"
                    title="Bring forward"
                  >
                    <ArrowUpFromLine size={16} strokeWidth={2} />
                    <span>Bring forward</span>
                  </button>
                  <button
                    onClick={handleBringToFront}
                    className="context-menu-option-item"
                    title="Bring to front"
                  >
                    <ArrowUpNarrowWide size={16} strokeWidth={2} />
                    <span>Bring to front</span>
                  </button>
                </>
              )}
              {canMoveBackward && (
                <>
                  <button
                    onClick={handleSendBackward}
                    className="context-menu-option-item"
                    title="Send backward"
                  >
                    <ArrowDownFromLine size={16} strokeWidth={2} />
                    <span>Send backward</span>
                  </button>
                  <button
                    onClick={handleSendToBack}
                    className="context-menu-option-item"
                    title="Send to back"
                  >
                    <ArrowDownNarrowWide size={16} strokeWidth={2} />
                    <span>Send to back</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        // Canvas options: Same styling as element options
        <div className="context-menu-section element-options-compact">
          {/* Paste option if there's a copied element */}
          {copiedElement && (
            <button
              onClick={handlePasteElement}
              className="context-menu-option-item"
              title="Paste element"
            >
              <Clipboard size={16} strokeWidth={2} />
              <span>Paste</span>
            </button>
          )}
          
          {/* Background option with submenu if any background styling exists */}
          {hasBackgroundStyling ? (
            <div
              ref={backgroundRef}
              style={{ 
                position: 'relative',
                width: '100%'
              }}
              onMouseEnter={() => {
                if (backgroundHideTimeoutRef.current) {
                  clearTimeout(backgroundHideTimeoutRef.current);
                  backgroundHideTimeoutRef.current = null;
                }
                setShowBackgroundOptions(true);
              }}
              onMouseLeave={(e) => {
                // Check if we're moving to the submenu
                const relatedTarget = e.relatedTarget;
                if (backgroundSubmenuRef.current && relatedTarget && relatedTarget instanceof Node && backgroundSubmenuRef.current.contains(relatedTarget)) {
                  return; // Don't hide, we're moving to submenu
                }
                // Delay hiding to allow smooth transition to submenu
                backgroundHideTimeoutRef.current = setTimeout(() => {
                  setShowBackgroundOptions(false);
                }, 150);
              }}
            >
              <div
                className="context-menu-option-item"
                style={{ position: 'relative' }}
              >
                <Palette size={16} strokeWidth={2} />
                <span>Background</span>
                <ChevronRight size={14} strokeWidth={2} style={{ marginLeft: 'auto' }} />
              </div>
              {showBackgroundOptions && (
                <div
                  ref={(el) => {
                    backgroundSubmenuRef.current = el;
                    // Position submenu when it appears
                    if (el && backgroundRef.current) {
                      requestAnimationFrame(() => {
                        // Check if refs are still valid
                        if (!el || !backgroundRef.current) return;
                        
                        const canvasContainer = document.querySelector('.canvas-container');
                        if (!canvasContainer) return;

                        const containerRect = canvasContainer.getBoundingClientRect();
                        const parentRect = backgroundRef.current.getBoundingClientRect();
                        const submenuRect = el.getBoundingClientRect();
                        
                        const containerBounds = {
                          left: containerRect.left,
                          top: containerRect.top,
                          right: containerRect.right,
                          bottom: containerRect.bottom
                        };

                        const padding = 10;
                        const margin = 4;

                        // Default: position to the right
                        let left = '100%';
                        let right = 'auto';
                        let marginLeft = '4px';
                        let marginRight = '0';

                        // Check if submenu would go off right edge
                        const rightEdge = parentRect.right + (submenuRect.width || 140) + margin;
                        if (rightEdge > containerBounds.right - padding) {
                          // Position to the left instead
                          left = 'auto';
                          right = '100%';
                          marginLeft = '0';
                          marginRight = '4px';
                        }

                        // Check if submenu would go off bottom edge
                        let top = '0';
                        let bottom = 'auto';
                        const bottomEdge = parentRect.bottom + (submenuRect.height || 100);
                        if (bottomEdge > containerBounds.bottom - padding) {
                          // Position above parent
                          top = 'auto';
                          bottom = '0';
                        }

                        el.style.left = left;
                        el.style.right = right;
                        el.style.top = top;
                        el.style.bottom = bottom;
                        el.style.marginLeft = marginLeft;
                        el.style.marginRight = marginRight;
                      });
                    }
                  }}
                  className="context-menu-submenu"
                  style={{
                    position: 'absolute',
                    left: '100%',
                    top: 0,
                    marginLeft: '4px',
                    minWidth: '140px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15)',
                    padding: '4px',
                    zIndex: 10000,
                    pointerEvents: 'auto'
                  }}
                  onMouseEnter={() => {
                    if (backgroundHideTimeoutRef.current) {
                      clearTimeout(backgroundHideTimeoutRef.current);
                      backgroundHideTimeoutRef.current = null;
                    }
                    setShowBackgroundOptions(true);
                  }}
                  onMouseLeave={(e) => {
                    // Check if we're moving back to the parent
                    const relatedTarget = e.relatedTarget;
                    if (backgroundRef.current && relatedTarget && relatedTarget instanceof Node && backgroundRef.current.contains(relatedTarget)) {
                      return; // Don't hide, we're moving back to parent
                    }
                    // Hide when leaving submenu
                    setShowBackgroundOptions(false);
                  }}
                >
                  {currentRightToolbarTab !== 'Design' && (
                    <button
                      onClick={handleBackgroundChange}
                      className="context-menu-option-item"
                      title="Edit background"
                    >
                      <Settings2 size={16} strokeWidth={2} />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={handleBackgroundDelete}
                    className="context-menu-option-item"
                    title="Delete background"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleBackgroundClick}
              className="context-menu-option-item"
              title="Open background options"
            >
              <Palette size={16} strokeWidth={2} />
              <span>Background</span>
            </button>
          )}

          {/* Duplicate slide option */}
          <button
            onClick={handleDuplicateSlide}
            className="context-menu-option-item"
            title="Duplicate slide"
          >
            <FiLayers size={16} strokeWidth={2} />
            <span>Duplicate</span>
          </button>

          {/* Add slide option with hover submenu */}
          <div
            ref={addSlideRef}
            style={{ 
              position: 'relative',
              width: '100%'
            }}
            onMouseEnter={() => {
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
              setShowAddSlideOptions(true);
            }}
            onMouseLeave={(e) => {
              // Check if we're moving to the submenu
              const relatedTarget = e.relatedTarget;
              if (submenuRef.current && relatedTarget && relatedTarget instanceof Node && submenuRef.current.contains(relatedTarget)) {
                return; // Don't hide, we're moving to submenu
              }
              // Delay hiding to allow smooth transition to submenu
              hideTimeoutRef.current = setTimeout(() => {
                setShowAddSlideOptions(false);
              }, 150);
            }}
          >
            <div
              className="context-menu-option-item"
              style={{ position: 'relative' }}
            >
              <Plus size={16} strokeWidth={2} />
              <span>Add slide</span>
              <ChevronRight size={14} strokeWidth={2} style={{ marginLeft: 'auto' }} />
            </div>
            {showAddSlideOptions && (
              <div
                ref={(el) => {
                  submenuRef.current = el;
                  // Position submenu when it appears
                  if (el && addSlideRef.current) {
                    requestAnimationFrame(() => {
                      // Check if refs are still valid
                      if (!el || !addSlideRef.current) return;
                      
                      const canvasContainer = document.querySelector('.canvas-container');
                      if (!canvasContainer) return;

                      const containerRect = canvasContainer.getBoundingClientRect();
                      const parentRect = addSlideRef.current.getBoundingClientRect();
                      const submenuRect = el.getBoundingClientRect();
                      
                      const containerBounds = {
                        left: containerRect.left,
                        top: containerRect.top,
                        right: containerRect.right,
                        bottom: containerRect.bottom
                      };

                      const padding = 10;
                      const margin = 4;

                      // Default: position to the right
                      let left = '100%';
                      let right = 'auto';
                      let marginLeft = '4px';
                      let marginRight = '0';

                      // Check if submenu would go off right edge
                      const rightEdge = parentRect.right + (submenuRect.width || 140) + margin;
                      if (rightEdge > containerBounds.right - padding) {
                        // Position to the left instead
                        left = 'auto';
                        right = '100%';
                        marginLeft = '0';
                        marginRight = '4px';
                      }

                      // Check if submenu would go off bottom edge
                      let top = '0';
                      let bottom = 'auto';
                      const bottomEdge = parentRect.bottom + (submenuRect.height || 100);
                      if (bottomEdge > containerBounds.bottom - padding) {
                        // Position above parent
                        top = 'auto';
                        bottom = '0';
                      }

                      el.style.left = left;
                      el.style.right = right;
                      el.style.top = top;
                      el.style.bottom = bottom;
                      el.style.marginLeft = marginLeft;
                      el.style.marginRight = marginRight;
                    });
                  }
                }}
                className="context-menu-submenu"
                style={{
                  position: 'absolute',
                  left: '100%',
                  top: 0,
                  marginLeft: '4px',
                  minWidth: '140px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 48px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15)',
                  padding: '4px',
                  zIndex: 10000,
                  pointerEvents: 'auto'
                }}
                onMouseEnter={() => {
                  if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
                  setShowAddSlideOptions(true);
                }}
                onMouseLeave={(e) => {
                  // Check if we're moving back to the parent
                  const relatedTarget = e.relatedTarget;
                  if (addSlideRef.current && relatedTarget && relatedTarget instanceof Node && addSlideRef.current.contains(relatedTarget)) {
                    return; // Don't hide, we're moving back to parent
                  }
                  // Hide when leaving submenu
                  setShowAddSlideOptions(false);
                }}
              >
                <button
                  onClick={handleAddSlideBefore}
                  className="context-menu-option-item"
                  title="Add slide before"
                >
                  <MoveUp size={16} strokeWidth={2} />
                  <span>Before</span>
                </button>
                <button
                  onClick={handleAddSlideAfter}
                  className="context-menu-option-item"
                  title="Add slide after"
                >
                  <MoveDown size={16} strokeWidth={2} />
                  <span>After</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextMenu;

