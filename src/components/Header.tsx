// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      <Link to="/" className="text-2xl font-bold text-blue-600">
        Spendly
      </Link>

      <nav>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Hello, {user.email}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
            <Link to="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
