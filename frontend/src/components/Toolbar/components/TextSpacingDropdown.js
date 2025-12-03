import React from 'react';
import { createPortal } from 'react-dom';
import { MoveHorizontal } from 'lucide-react';

/**
 * Text spacing dropdown component
 */
const TextSpacingDropdown = ({ 
  selectedElement, 
  textFormatting, 
  activeDropdown, 
  dropdownPos, 
  onOpenSpacing, 
  onApplyFormat 
}) => {
  return (
    <>
      <div className="custom-dropdown">
        <button
          className="toolbar-button dropdown-trigger text-spacing-btn"
          title="Text Spacing"
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            onOpenSpacing(rect);
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1',
              fontWeight: 600,
              gap: '0px',
              margin: '0',
              padding: '0',
            }}
          >
            <span style={{ fontSize: '13px', marginBottom: '-2px', padding: '0', lineHeight: '1', transform: 'translateY(2px)', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>T</span>
            <MoveHorizontal size={22} strokeWidth={2.2} style={{ margin: '0', padding: '0', marginTop: '-2px' }} />
          </div>
        </button>
      </div>

      {activeDropdown === 'spacing' && createPortal(
        <div className="dropdown-menu" style={{
          position: 'absolute',
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: 180,
          zIndex: 999999,
        }}>
          <div className="dropdown-item">
            <span>Letter spacing</span>
            <div className="spacing-controls">
              <button onClick={(e) => {
                e.stopPropagation();
                onApplyFormat('letterSpacing', Math.max(0, (selectedElement?.letterSpacing || textFormatting.letterSpacing || 0) - 1));
              }}>–</button>
              <span>{selectedElement?.letterSpacing || textFormatting.letterSpacing || 0}</span>
              <button onClick={(e) => {
                e.stopPropagation();
                onApplyFormat('letterSpacing', (selectedElement?.letterSpacing || textFormatting.letterSpacing || 0) + 1);
              }}>+</button>
            </div>
          </div>
          <div className="dropdown-item">
            <span>Line spacing</span>
            <div className="spacing-controls">
              <button onClick={(e) => {
                e.stopPropagation();
                onApplyFormat('lineHeight', Math.max(0.8, (selectedElement?.lineHeight || textFormatting.lineHeight || 1.2) - 0.1));
              }}>–</button>
              <span>{(selectedElement?.lineHeight || textFormatting.lineHeight || 1.2).toFixed(1)}</span>
              <button onClick={(e) => {
                e.stopPropagation();
                onApplyFormat('lineHeight', (selectedElement?.lineHeight || textFormatting.lineHeight || 1.2) + 0.1);
              }}>+</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TextSpacingDropdown;

