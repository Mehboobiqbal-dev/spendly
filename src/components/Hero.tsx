import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center md:space-x-8 p-8 bg-gradient-to-r from-blue-50 to-white">
      <motion.div 
        className="md:w-1/2"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-black">
          Welcome to Spendly
        </h1>
        <p className="text-lg text-black mb-6">
          Spendly is your smart, personal expense tracker designed to help you manage your finances with ease.
          Track your daily spending, categorize your expenses automatically, and unlock detailed insights through 
          dynamic, real‑time reports. Our intuitive interface, makes
          managing money engaging and efficient.
        </p>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition transform hover:-translate-y-1 shadow-lg"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition transform hover:-translate-y-1 shadow-lg"
          >
            Login
          </Link>
        </div>
      </motion.div>
      <motion.div 
        className="md:w-1/2 mb-8 md:mb-0"
        initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 1 }}
        style={{ perspective: 1000 }}
      >
        
     
      </motion.div>
    </section>
  );
};

export default Hero;
