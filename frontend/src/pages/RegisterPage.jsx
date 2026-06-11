import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Terminal, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString(36).substring(7));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await register(name, email, password, avatarUrl);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomizeAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-dark-bg px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 dark:text-brand-400 mb-4">
            <Terminal className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-dark-muted">
            Join CodeSync to start collaborating
          </p>
        </div>

        {error && (
          <Alert message={error} type="error" onClose={() => setError('')} />
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* Avatar Selector */}
          <div className="flex flex-col items-center gap-3 bg-slate-50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-slate-100 dark:border-dark-border/40">
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="h-16 w-16 rounded-full bg-slate-200 border border-slate-300 dark:border-dark-border"
              />
              <button
                type="button"
                onClick={handleRandomizeAvatar}
                className="absolute -bottom-1 -right-1 p-1 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-md transition-transform hover:rotate-180 duration-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="text-xs text-slate-500 dark:text-dark-muted font-semibold">
              Customize Your Avatar Robot
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 dark:border-dark-border bg-slate-50 dark:bg-dark-bg py-3 pl-10 pr-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 dark:border-dark-border bg-slate-50 dark:bg-dark-bg py-3 pl-10 pr-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 dark:border-dark-border bg-slate-50 dark:bg-dark-bg py-3 pl-10 pr-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                  placeholder="•••••••• (Min 6 characters)"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg focus:outline-none transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-dark-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-500 dark:text-brand-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
