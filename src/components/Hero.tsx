// src/components/Hero.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => (
  <section className="flex flex-col-reverse md:flex-row items-center md:space-x-8 p-8 bg-gradient-to-r from-blue-50 to-white">
    <div className="md:w-1/2">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-700">
        Spendly
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Take control of your finances with Spendly—your personal expense tracker.
        Log your daily spending, categorize effortlessly, and unlock insights
        through beautiful, real‑time charts.
      </p>
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <Link
          to="/register"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          Login
        </Link>
      </div>
    </div>
    <div className="md:w-1/2 mb-8 md:mb-0">
     
    </div>
  </section>
);

export default Hero;
