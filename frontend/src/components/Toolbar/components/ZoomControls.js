import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

/**
 * Zoom controls component for canvas zoom
 */
const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onResetZoom }) => {
  return (
    <div className="zoom-controls">
      <div className="zoom-separator"></div>
      <button
        className="zoom-button"
        onClick={onZoomOut}
        title="Zoom Out (Ctrl+-)"
        disabled={zoom <= 50}
      >
        <ZoomOut size={16} />
      </button>
      <div className="zoom-percentage" title="Click to reset zoom">
        <span onClick={onResetZoom} style={{ cursor: 'pointer' }}>
          {zoom}%
        </span>
      </div>
      <button
        className="zoom-button"
        onClick={onZoomIn}
        title="Zoom In (Ctrl++)"
        disabled={zoom >= 200}
      >
        <ZoomIn size={16} />
      </button>
    </div>
  );
};

export default ZoomControls;

