// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import bgImage from './assets/background.jpg'; // Directly import the background image

const appStyle: React.CSSProperties = {
 
};

const App: React.FC = () => {
  // JavaScript preload: this creates a new Image and sets its src so the browser caches it
  useEffect(() => {
    const img = new Image();
    img.src = bgImage;
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div style={appStyle}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
