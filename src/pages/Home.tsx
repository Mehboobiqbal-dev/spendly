import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';

const Home: React.FC = () => (
  <div className="min-h-screen flex flex-col">
    <Header />

    <main className="flex-grow">
      <Hero />

      <section className="py-12 px-8 bg-black">
        <h2 className="text-3xl font-semibold text-center mb-8 text-black">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-black">Secure Authentication</h3>
            <p className="text-black">Sign up and log in safely with Firebase Auth. Your data is private.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-black">Expense Management</h3>
            <p className="text-black">
              Add, edit, or delete expenses—track amount, category, date, and notes in real time.
            </p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-black">Visual Reports</h3>
            <p className="text-black">
              Get instant category‑wise breakdowns and summary statistics via charts.
            </p>
          </div>
        </div>
      </section>
    </main>

    <footer className="text-center py-4 bg-gray-100 text-black">
      © {new Date().getFullYear()} Spendly. All rights reserved.
    </footer>
  </div>
);

export default Home;