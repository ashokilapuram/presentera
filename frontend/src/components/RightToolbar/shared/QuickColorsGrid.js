import React from 'react';

const QuickColorsGrid = ({ colors, onColorSelect, titles, gridStyle }) => (
  <div className="quick-colors-grid" style={gridStyle}>
    {colors.map((color, index) => {
      const isWhite = color === '#ffffff';
      return (
        <div
          key={`${color}-${index}`}
          className={`color-swatch-small${index >= colors.length - 2 ? ' quick-color-extra' : ''}`}
          style={{
            backgroundColor: color,
            ...(isWhite && { border: '1.5px solid #e5e7eb' })
          }}
          onClick={(e) => {
            e.stopPropagation();
            onColorSelect(color);
          }}
          title={titles?.[index] || color}
        />
      );
    })}
  </div>
);

export default React.memo(QuickColorsGrid);

