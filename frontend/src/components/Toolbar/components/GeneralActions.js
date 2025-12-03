import React, { useState, useRef, useEffect } from 'react';
import { Undo, Redo, RotateCw, FolderUp } from 'lucide-react';
import { FiPlay, FiDownload, FiChevronDown } from 'react-icons/fi';

/**
 * General actions buttons component
 */
const GeneralActions = ({ 
  canUndo, 
  canRedo, 
  isFullscreen,
  onUndo, 
  onRedo, 
  onStartFullScreenSlideshow, 
  onDownloadPresentation,
  isDownloading = false,
  onToggleFullscreen, 
  onReset,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onUploadPPTX,
  isUploading = false
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target)) {
        setShowDownloadMenu(false);
      }
    };

    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadMenu]);

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    setShowDownloadMenu(!showDownloadMenu);
  };

  const handleDownloadPowerPoint = () => {
    setShowDownloadMenu(false);
    onDownloadPresentation();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      alert('Please upload a .pptx file only.');
      e.target.value = ''; // Reset input
      return;
    }

    if (onUploadPPTX) {
      await onUploadPPTX(file);
    }

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <>
      <button 
        className={`toolbar-button ${!canUndo ? 'disabled' : ''}`}
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo size={16} />
      </button>
      <button 
        className={`toolbar-button ${!canRedo ? 'disabled' : ''}`}
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
      >
        <Redo size={16} />
      </button>
      {/* Download button removed - code kept for future use */}
      {/* <div className="download-button-wrapper" ref={downloadMenuRef} style={{ position: 'relative' }}>
        <button 
          className="toolbar-button"
          onClick={handleDownloadClick}
          title="Download Presentation"
        >
          <FiDownload size={16} />
          <FiChevronDown size={12} style={{ marginLeft: '4px' }} />
        </button>
        {showDownloadMenu && (
          <div className="download-menu" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 1000,
            minWidth: '180px',
            overflow: 'hidden'
          }}>
            <button
              className="download-menu-item"
              onClick={handleDownloadPowerPoint}
              style={{
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <FiDownload size={16} />
              <span>PowerPoint (.pptx)</span>
            </button>
          </div>
        )}
      </div> */}
      <button 
        className="toolbar-button primary"
        onClick={onStartFullScreenSlideshow}
        title="Start Slideshow (F5)"
      >
        <FiPlay size={16} />
        Slideshow
      </button>
      <button 
        className="toolbar-button"
        onClick={onDownloadPresentation}
        title="Download as PowerPoint (.pptx)"
        disabled={isDownloading}
        style={isDownloading ? { 
          backgroundColor: '#000000',
          cursor: 'wait'
        } : {}}
      >
        {isDownloading ? (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
        ) : (
          <FiDownload size={16} />
        )}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        accept=".pptx"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <button 
        className="toolbar-button"
        onClick={handleUploadClick}
        title="Upload PowerPoint (.pptx)"
        disabled={isUploading}
        style={isUploading ? { 
          backgroundColor: '#000000',
          cursor: 'wait'
        } : {}}
      >
        {isUploading ? (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
        ) : (
          <FolderUp size={18} />
        )}
      </button>
      <button 
        className="toolbar-button"
        onClick={onReset}
        title="Reset App (New Slide)"
      >
        <RotateCw size={16} />
      </button>
    </>
  );
};

export default GeneralActions;

