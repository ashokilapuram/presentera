import React from 'react';
import { Palette, Trash2 } from 'lucide-react';

const ColorPickerGroup = ({ 
  value, 
  onChange, 
  onReset, 
  pickerTitle = "Pick custom color",
  resetTitle = "Reset to default color"
}) => (
  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
    <div style={{ position: 'relative', width: '36px', height: '36px' }}>
      <input
        type="color"
        value={value}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
          zIndex: 2
        }}
        title={pickerTitle}
      />
      <div style={{
        width: '36px',
        height: '36px',
        background: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Palette size={16} />
      </div>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onReset();
      }}
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
      title={resetTitle}
    >
      <Trash2 size={18} />
    </button>
  </div>
);

export default React.memo(ColorPickerGroup);

