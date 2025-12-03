import React, { useState, useEffect } from 'react';

const ClipartOptions = ({ addClipart, onClose }) => {
  const [clipartGroups, setClipartGroups] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load clipart images from public/clipart folders
    const loadClipart = async () => {
      // Load known clipart files
      const clipartManifest = {
        animals: [
          '1F414.png',
          '1F431.png',
          '1F436.png',
          '1F9A2.png',
          '1F9A3.png',
          '1F9F8.png'
        ],
        shapes: [
          '1F388.png',
          '1F6AB.png',
          '2194.png',
          '2764.png',
          '2B05.png',
          '2B8F.png'
        ],
        tech: [
          '1F4BE.png',
          '1F4E9.png',
          '1F5A5.png',
          '1F5A8.png',
          '1F6E9.png',
          '1F6F0.png'
        ]
      };

      const loadedGroups = {};
      const publicUrl = process.env.PUBLIC_URL || '';
      
      for (const [folder, files] of Object.entries(clipartManifest)) {
        loadedGroups[folder] = files.map(fileName => ({
          name: fileName.replace('.png', ''),
          path: `${publicUrl}/clipart/${folder}/${fileName}`,
          url: `${publicUrl}/clipart/${folder}/${fileName}`
        }));
      }

      setClipartGroups(loadedGroups);
      setLoading(false);
    };

    loadClipart();
  }, []);

  const handleClipartClick = (clipart) => {
    if (addClipart) {
      addClipart(clipart.url, clipart.name);
      // Close clipart options after adding
      if (onClose) {
        onClose();
      }
    }
  };

  if (loading) {
    return (
      <div className="right-toolbar-section">
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
          Loading clipart...
        </div>
      </div>
    );
  }

  return (
    <div className="right-toolbar-section">
      <div className="section-title">Clipart</div>
      <div className="option-group">
        {Object.entries(clipartGroups).map(([folderName, cliparts]) => (
          <div key={folderName} style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              color: '#6b7280', 
              marginBottom: '8px', 
              textTransform: 'uppercase',
              letterSpacing: '0.5px' 
            }}>
              {folderName}
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '8px' 
            }}>
              {cliparts.map((clipart, index) => (
                <div
                  key={index}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClipartClick(clipart);
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.dataset.selected) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.dataset.selected) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }
                  }}
                  title={clipart.name}
                >
                  <img
                    src={clipart.url}
                    alt={clipart.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div style="color: #9ca3af; font-size: 10px; text-align: center;">Failed to load</div>';
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClipartOptions;

