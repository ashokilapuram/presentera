import React from 'react';
import { FiType, FiSquare, FiImage } from 'react-icons/fi';

const DefaultSection = ({ selectedElement, updateSlideElement, addTextBox, addShape, addImage }) => {
  return (
    <div className="right-toolbar-section">
      <div className="section-title">Quick actions</div>
      <div className="option-group">
        <button className="quick-button" onClick={() => addTextBox('content')}>
          <FiType />
          <span>Add Text</span>
        </button>
        <button className="quick-button" onClick={() => addShape('square')}>
          <FiSquare />
          <span>Add Shape</span>
        </button>
        <button className="quick-button" onClick={addImage}>
          <FiImage />
          <span>Add Image</span>
        </button>
      </div>

      <div className="section-title">Properties</div>
      <div className="option-group">
        {selectedElement ? (
          <div className="element-info">
            <div className="info-row">
              <span>Type:</span>
              <span>{selectedElement.type}</span>
            </div>
            <div className="info-row">
              <span>X:</span>
              <span>{Math.round(selectedElement.x)}px</span>
            </div>
            <div className="info-row">
              <span>Y:</span>
              <span>{Math.round(selectedElement.y)}px</span>
            </div>
            <div className="info-row">
              <span>Width:</span>
              <span>{Math.round(selectedElement.width)}px</span>
            </div>
            <div className="info-row">
              <span>Height:</span>
              <span>{Math.round(selectedElement.height)}px</span>
            </div>
            {selectedElement.type === 'chart' && (
              <>
                <div className="info-row">
                  <span>Chart:</span>
                  <span>{selectedElement.chartType}</span>
                </div>

                <div className="section-title" style={{ marginTop: 10 }}>Chart color</div>
                <div className="option-group" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="color"
                    value={selectedElement.color || '#0ea5e9'}
                    onChange={(e) => updateSlideElement(selectedElement.id, { color: e.target.value })}
                    className="color-input"
                  />
                </div>

                <div className="section-title" style={{ marginTop: 10 }}>Data points</div>
                <div className="option-group" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(selectedElement.labels || []).map((label, index) => {
                    const value = (selectedElement.values || [])[index] ?? 0;
                    return (
                      <div key={index} style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(60px, 80px) minmax(28px, 32px)', 
                        gap: 6, 
                        alignItems: 'center',
                        width: '100%',
                        minWidth: 0
                      }}>
                        <input
                          type="text"
                          value={label}
                          onChange={(e) => {
                            const newLabels = [...(selectedElement.labels || [])];
                            newLabels[index] = e.target.value;
                            updateSlideElement(selectedElement.id, { labels: newLabels });
                          }}
                          placeholder="Label"
                          style={{ 
                            padding: '4px 6px', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: 4,
                            fontSize: '12px',
                            minWidth: 0,
                            width: '100%'
                          }}
                        />
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => {
                            const num = Number(e.target.value);
                            const newValues = [...(selectedElement.values || [])];
                            newValues[index] = isNaN(num) ? 0 : num;
                            updateSlideElement(selectedElement.id, { values: newValues });
                          }}
                          placeholder="Value"
                          style={{ 
                            padding: '4px 6px', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: 4,
                            fontSize: '12px',
                            width: '100%'
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newLabels = [...(selectedElement.labels || [])];
                            const newValues = [...(selectedElement.values || [])];
                            newLabels.splice(index, 1);
                            newValues.splice(index, 1);
                            updateSlideElement(selectedElement.id, { labels: newLabels, values: newValues });
                          }}
                          title="Remove"
                          style={{
                            height: 24,
                            width: 24,
                            borderRadius: 4,
                            border: '1px solid #ef4444',
                            background: '#fff5f5',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 24
                          }}
                        >
                          −
                        </button>
                      </div>
                    );
                  })}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newLabels = [...(selectedElement.labels || []), `Item ${(selectedElement.labels?.length || 0) + 1}`];
                      const newValues = [...(selectedElement.values || []), 0];
                      updateSlideElement(selectedElement.id, { labels: newLabels, values: newValues });
                    }}
                    style={{
                      marginTop: 4,
                      height: 32,
                      borderRadius: 6,
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Data Point
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="no-selection">
            No element selected
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultSection;

