import React, { useState } from 'react';
import TemplateSelectionModal from '../TemplateSelectionModal/TemplateSelectionModal';

const Templates = ({ onSelectTemplate, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleTemplateSelect = async (template) => {
    try {
      const response = await fetch(template.jsonFile);
      const templateData = await response.json();
      if (templateData && onSelectTemplate) {
        onSelectTemplate(templateData);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <TemplateSelectionModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onSelectTemplate={handleTemplateSelect}
    />
  );
};

export default Templates;


