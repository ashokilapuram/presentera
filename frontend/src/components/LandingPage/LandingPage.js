import React, { useState } from 'react';
import './LandingPage.css';
import TemplateSelectionModal from '../TemplateSelectionModal/TemplateSelectionModal';

const LandingPage = ({ onLaunchPresentify }) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchClick = () => {
    setShowTemplateModal(true);
  };

  const handleTemplateSelect = (template) => {
    onLaunchPresentify(template);
  };

  const handleCreateNew = () => {
    // Create a blank canvas with no template
    onLaunchPresentify(null);
  };

  const handleCloseModal = () => {
    setShowTemplateModal(false);
  };
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="logo-section">
                <img 
                  src="/images/logo/presentera_logo.png" 
                  alt="Presentera Logo" 
                  className="logo-icon-image"
                />
                <img 
                  src="/images/logo/presentera_name.png" 
                  alt="Presentera" 
                  className="logo-name-image"
                />
              </div>
              
              <h1 className="hero-title">
                <span className="title-bold">Create Stunning</span>
                <span className="title-gray">Presentations</span>
              </h1>
              
              <p className="hero-description">
                Professional presentation software designed for modern teams. 
                Create, collaborate, and present with confidence.
              </p>
              
              <div className="hero-buttons">
                <button className="btn-primary" onClick={handleLaunchClick}>
                  Launch Presentera
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="btn-secondary" onClick={() => scrollToSection('learn-more-section')}>
                  Learn More
                </button>
              </div>
            </div>
            
            <div className="hero-image">
              <img src="/images/hero-workspace.jpg" alt="Presentera Workspace" />
            </div>
          </div>
        </div>
      </section>

      {/* Learn More Section */}
      <section id="learn-more-section" className="learn-more-section">
        <div className="learn-more-container">
          <div className="section-header">
            <h2 className="section-title">Learn More</h2>
            <p className="section-subtitle">
              Discover how to create stunning presentations with our intuitive features
            </p>
          </div>
          
          <div className="learn-more-content">
            <div className="app-mockup">
              <img src="/images/feature-presentations.jpg" alt="Presentera App Interface" />
            </div>
            
            <div className="features-list">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="feature-title">Drag & Drop Canvas</h3>
                <p className="feature-description">
                  You can drag and drop the canvas wherever you want for flexible presentation layouts
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6H20M4 12H20M4 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="feature-title">Edit Textboxes</h3>
                <p className="feature-description">
                  Customize text with rich editing options, fonts, sizes, and formatting
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" fill="currentColor"/>
                    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="feature-title">Color Customization</h3>
                <p className="feature-description">
                  Apply custom colors to any element with an intuitive color picker
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="feature-title">Insert Images</h3>
                <p className="feature-description">
                  Add images to your presentations with drag-and-drop simplicity
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={showTemplateModal}
        onClose={handleCloseModal}
        onSelectTemplate={handleTemplateSelect}
        showCreateNew={true}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
};

export default LandingPage;
