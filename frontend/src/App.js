import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage/LandingPage';
import EditorApp from './components/EditorApp/EditorApp';

// Landing Page Route Component
function LandingPageRoute() {
  const handleLaunchClick = (template) => {
    if (template) {
      // Store template in sessionStorage to load it in the app
      sessionStorage.setItem('selectedTemplate', JSON.stringify(template));
    }
    window.location.href = '/app';
  };

  return <LandingPage onLaunchPresentify={handleLaunchClick} />;
}

// App with routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageRoute />} />
        <Route path="/app" element={<EditorApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
