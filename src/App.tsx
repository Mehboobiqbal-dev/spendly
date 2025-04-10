import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import bgImage from './assets/background.jpg'; // Corrected path

const appStyle = {
  backgroundImage: `url(${bgImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  height: "100vh",
  width: "100vw",
};

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <div style={appStyle}> {/* Applied background styling */}
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

export default App;
