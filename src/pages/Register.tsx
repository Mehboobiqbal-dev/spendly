// src/pages/Register.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const { user, signInWithGoogle, signInWithGithub } = useAuth();

  // Automatically navigate when a user is present (after successful sign‑up)
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle email/password registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // no need to call navigate here; the useEffect will trigger on auth change.
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Failed to create account. Try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold text-center text-black mb-6">
          Create Your Account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-black border border-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black text-black font-semibold rounded-lg hover:bg-gray-800 transition"
          >
            Register
          </button>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-black">Or sign up with:</p>
          <div className="flex justify-center gap-4 mt-2">
            <button
              // Option 1: Rely on the observer to navigate after successful social sign‑in
              onClick={async () => {
                await signInWithGoogle();
                // Optionally, you can also explicitly navigate:
                // navigate('/dashboard');
              }}
              className="px-4 py-2 bg-red-500 text-black rounded hover:bg-red-600 transition"
            >
              Google
            </button>
            <button
              onClick={async () => {
                await signInWithGithub();
               
              }}
              className="px-4 py-2 bg-black text-black rounded hover:bg-gray-800 transition"
            >
              GitHub
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-black">
          Already have an account?{' '}
          <Link to="/login" className="text-black hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
