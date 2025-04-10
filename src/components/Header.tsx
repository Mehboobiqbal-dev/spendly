import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();

  // Check the current route so that we don't display a link to the page we’re already on
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <header className="w-full bg-gradient-to-r from-white to-blue-50 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-blue-600 tracking-tight hover:opacity-90 transition"
        >
          Spendly
        </Link>

        {/* Navigation: Only Login and Register */}
        <nav className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {!isLoginPage && (
              <Link
                to="/login"
                className="px-5 py-2 border border-blue-600 text-blue-600 rounded-lg shadow-sm hover:bg-blue-100 transition-all"
              >
                Login
              </Link>
            )}
            
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
