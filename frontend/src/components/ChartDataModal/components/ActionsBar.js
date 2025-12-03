import React from 'react';

/**
 * Actions bar component with Add Row button and Save/Cancel buttons
 */
const ActionsBar = ({ onAddRow, onCancel, onSave }) => {
  return (
    <div className="chart-data-actions">
      <button
        onClick={onAddRow}
        className="add-row-button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Add Row
      </button>
      <div className="chart-data-actions-right">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default ActionsBar;

