import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const { user, signInWithGoogle, signInWithGithub } = useAuth();

  // Automatically navigate to dashboard if user is already logged in
  useEffect(() => {
    if(user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with that email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError('Failed to log in. Try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold text-center text-black mb-6">
          Sign In to Spendly
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
            style={{ color: 'black' }}
            className="w-full py-3 bg-black font-semibold rounded-lg hover:bg-gray-800 transition"
          >
            Log In
          </button>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-black">Or sign in with:</p>
          <div className="flex justify-center gap-4 mt-2">
            <button
              onClick={async () => {
                await signInWithGoogle();
                navigate('/dashboard');  
              }}
              style={{ color: 'black' }}
  className="w-full py-3 bg-black font-semibold rounded-lg hover:bg-gray-800 transition"
>
              Google
            </button>
            <button
              onClick={async () => {
                await signInWithGithub();
                navigate('/dashboard');
              }}
              style={{ color: 'black' }}
  className="w-full py-3 bg-black font-semibold rounded-lg hover:bg-gray-800 transition"
>
              GitHub
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-black">
          Don’t have an account?{' '}
          <Link to="/register" className="text-black hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
