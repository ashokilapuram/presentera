import React, { useState } from 'react';

/**
 * Component for bar and line chart color palettes
 */
const BarLineColorPalettes = ({ selectedElement, updateSlideElement }) => {
  const [activeTab, setActiveTab] = useState('colorful');
  const colorfulPalettes = [
    ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#06b6d4'],
    ['#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'],
    ['#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'],
    ['#f59e0b', '#f43f5e', '#10b981', '#0ea5e9', '#8b5cf6', '#84cc16']
  ];

  const monochromePalettes = [
    { base: '#8b5cf6', shades: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'] },
    { base: '#10b981', shades: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'] },
    { base: '#f59e0b', shades: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'] },
    { base: '#f43f5e', shades: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'] },
    { base: '#06b6d4', shades: ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'] },
    { base: '#000000', shades: ['#000000', '#1f2937', '#374151', '#6b7280', '#9ca3af'] }
  ];

  const applyPalette = (palette, isMonochrome = false) => {
    if (selectedElement.series && Array.isArray(selectedElement.series)) {
      // New format: update each series with colors from palette
      const updatedSeries = selectedElement.series.map((series, seriesIndex) => {
        if (selectedElement.chartType === 'line') {
          // For line charts: one color per series (line color)
          const colors = isMonochrome ? palette.shades : palette;
          return {
            ...series,
            barColors: (series.values || []).map(() => colors[seriesIndex % colors.length])
          };
        } else {
          // For bar charts: one color per series (first element in barColors array)
          const colors = isMonochrome ? palette.shades : palette;
          return {
            ...series,
            barColors: [colors[seriesIndex % colors.length]]
          };
        }
      });
      updateSlideElement(selectedElement.id, { series: updatedSeries });
    } else {
      // Old format: apply to barColors array
      const labels = selectedElement.labels || [];
      const colors = isMonochrome ? palette.shades : palette;
      const newBarColors = labels.map((_, i) => colors[i % colors.length]);
      updateSlideElement(selectedElement.id, { barColors: newBarColors });
    }
  };

  return (
    <div className="option-group" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.5rem',
      padding: '0.75rem'
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '0.25rem'
      }}>
        <button
          onClick={() => setActiveTab('colorful')}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'colorful' ? '#000000' : '#6b7280',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'colorful' ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderBottom: activeTab === 'colorful' ? '2px solid #000000' : '2px solid transparent',
            marginBottom: '-1px'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'colorful') {
              e.currentTarget.style.color = '#374151';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'colorful') {
              e.currentTarget.style.color = '#6b7280';
            }
          }}
        >
          Colorful
        </button>
        <button
          onClick={() => setActiveTab('monochromatic')}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'monochromatic' ? '#000000' : '#6b7280',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'monochromatic' ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderBottom: activeTab === 'monochromatic' ? '2px solid #000000' : '2px solid transparent',
            marginBottom: '-1px'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'monochromatic') {
              e.currentTarget.style.color = '#374151';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'monochromatic') {
              e.currentTarget.style.color = '#6b7280';
            }
          }}
        >
          Monochromatic
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'colorful' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '0.375rem',
            width: '100%'
          }}>
            {colorfulPalettes.map((palette, paletteIndex) => (
              <div
                key={`colorful-${paletteIndex}`}
                onClick={() => applyPalette(palette, false)}
                className="color-palette-item"
                style={{
                  display: 'flex',
                  gap: '0.25rem',
                  cursor: 'pointer',
                  padding: '0.375rem',
                  borderRadius: '0.5rem',
                  border: '2px solid transparent',
                  background: '#f9fafb',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#000000';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {palette.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="color-swatch-palette"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: color,
                      borderRadius: '0.25rem',
                      border: '1px solid rgba(0,0,0,0.08)',
                      flexShrink: 0,
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'monochromatic' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '0.375rem',
            width: '100%'
          }}>
            {monochromePalettes.map((palette, paletteIndex) => (
              <div
                key={`mono-${paletteIndex}`}
                onClick={() => applyPalette(palette, true)}
                className="color-palette-item"
                style={{
                  display: 'flex',
                  gap: '0.25rem',
                  cursor: 'pointer',
                  padding: '0.375rem',
                  borderRadius: '0.5rem',
                  border: '2px solid transparent',
                  background: '#f9fafb',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#000000';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {palette.shades.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="color-swatch-palette"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: color,
                      borderRadius: '0.25rem',
                      border: '1px solid rgba(0,0,0,0.08)',
                      flexShrink: 0,
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarLineColorPalettes;

