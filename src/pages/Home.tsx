// src/pages/Home.tsx
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <Hero />

        <section className="py-12 px-8 bg-white">
          <h2 className="text-3xl font-semibold text-center mb-8 text-black">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              className="p-6 border rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-2 text-black">Secure Authentication</h3>
              <p className="text-black">
                Sign up and log in safely with Firebase Auth. Your data is private.
              </p>
            </motion.div>

            <motion.div 
              className="p-6 border rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-2 text-black">Expense Management</h3>
              <p className="text-black">
                Add, edit, or delete expenses—track amount, category, date, and notes in real time.
              </p>
            </motion.div>

            <motion.div 
              className="p-6 border rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-2 text-black">Visual Reports</h3>
              <p className="text-black">
                Get instant category‑wise breakdowns and summary statistics via charts.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="text-center py-4 bg-gray-100 text-black">
        © {new Date().getFullYear()} Spendly. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
