import React from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown } from 'react-icons/fi';

/**
 * Font family dropdown component
 */
const FontFamilyDropdown = ({ 
  selectedElement, 
  textFormatting, 
  onOpenDropdown, 
  activeDropdown, 
  dropdownPos, 
  onApplyFormat 
}) => {
  const fonts = ["Inter", "Playfair Display", "Arial", "Times New Roman", "Courier New"];

  return (
    <>
      <div className="custom-dropdown">
        <button
          className="toolbar-button dropdown-trigger"
          onClick={(e) => { 
            e.stopPropagation(); 
            onOpenDropdown(e, "family"); 
          }}
          style={{
            fontFamily: selectedElement?.fontFamily || textFormatting.fontFamily || 'Inter',
            minWidth: "100px",
          }}
        >
          {selectedElement?.fontFamily || textFormatting.fontFamily || "Inter"}
          <FiChevronDown size={14} />
        </button>
      </div>

      {activeDropdown === "family" && createPortal(
        <div
          className="dropdown-menu"
          style={{
            position: "absolute",
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 999999,
          }}
        >
          {fonts.map((font) => (
            <div
              key={font}
              className="dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                onApplyFormat("fontFamily", font);
              }}
              style={{
                fontFamily: font,
              }}
            >
              {font}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export default FontFamilyDropdown;

