import React from 'react';
import { Trash2 } from 'lucide-react';

/**
 * Table header component with series name inputs and add/remove buttons
 */
const TableHeader = ({ series, onSeriesNameChange, onRemoveSeries, onAddSeries }) => {
  return (
    <thead>
      <tr>
        <th className="table-header-cell">Label</th>
        {series.map((s, seriesIndex) => (
          <th key={seriesIndex} className="table-header-cell series-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <input
                type="text"
                value={s.name}
                onChange={(e) => onSeriesNameChange(seriesIndex, e.target.value)}
                className="series-name-input"
                placeholder={`Series ${seriesIndex + 1}`}
              />
              {series.length > 1 && (
                <button
                  onClick={() => onRemoveSeries(seriesIndex)}
                  className="remove-series-button"
                  title="Remove series"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </th>
        ))}
        <th className="table-header-cell actions-header">
          <button
            onClick={onAddSeries}
            className="add-series-button"
            title="Add series"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>Add series</span>
          </button>
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;

