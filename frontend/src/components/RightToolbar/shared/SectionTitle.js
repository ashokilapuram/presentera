import React from 'react';

const SectionTitle = ({ icon, text, style }) => (
  <div className="section-title" style={{ display: 'flex', alignItems: 'center', ...style }}>
    {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
    {text}
  </div>
);

export default React.memo(SectionTitle);

