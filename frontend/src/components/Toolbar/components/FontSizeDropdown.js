import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Font size dropdown component
 */
const FontSizeDropdown = ({ 
  activeDropdown, 
  dropdownPos, 
  onApplyFormat 
}) => {
  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 80, 120, 150, 170, 200];

  return (
    <>
      {activeDropdown === "size" && createPortal(
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
          {fontSizes.map((size) => (
            <div
              key={size}
              className="dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                onApplyFormat("fontSize", parseInt(size));
              }}
            >
              {size}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export default FontSizeDropdown;

