import React from 'react';
import './TemplateSelectionModal.css';

const TemplateSelectionModal = ({ isOpen, onClose, onSelectTemplate, showCreateNew = false, onCreateNew }) => {
  const templates = [
    {
      id: 'sample_1',
      name: 'Bold Pitch Deck Cover',
      thumbnail: '/images/templates/sample_1.png',
      jsonFile: '/templates/sample_1.json'
    },
    {
      id: 'sample_2', 
      name: 'Creative Startup Deck',
      thumbnail: '/images/templates/sample_2.png',
      jsonFile: '/templates/sample_2.json'
    },
    {
      id: 'sample_3',
      name: 'Modern Music Theme',
      thumbnail: '/images/templates/sample_3.png',
      jsonFile: '/templates/sample_3.json'
    },
    {
      id: 'sample_4',
      name: 'Corporate Business Blueprint',
      thumbnail: '/images/templates/sample_4.png',
      jsonFile: '/templates/sample_4.json'
    },
    {
      id: 'sample_5',
      name: 'Digital Transformation Strategy',
      thumbnail: '/images/templates/sample_5.png',
      jsonFile: '/templates/sample_5.json'
    },
    {
      id: 'sample_6',
      name: 'AI Innovation Cover Slide',
      thumbnail: '/images/templates/sample_6.png',
      jsonFile: '/templates/sample_6.json'
    }
  ];

  if (!isOpen) return null;

  const handleTemplateSelect = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="template-modal-scrollable">
          <div className="template-modal-header">
            <h2>Choose a Template</h2>
            <button className="close-button" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          
          <div className="template-grid">
            {templates.map((template) => (
              <div 
                key={template.id}
                className="template-card"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="template-thumbnail">
                  <img 
                    src={template.thumbnail} 
                    alt={template.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="template-placeholder" style={{ display: 'none' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <polygon points="8,12 12,8 16,12" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="template-modal-footer">
          {showCreateNew ? (
            <button 
              className="btn-create-new" 
              onClick={() => {
                if (onCreateNew) {
                  onCreateNew();
                }
                onClose();
              }}
            >
              Create New
            </button>
          ) : (
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectionModal;
