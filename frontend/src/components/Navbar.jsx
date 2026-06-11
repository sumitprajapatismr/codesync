import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Terminal, LogOut, User as UserIcon, LayoutDashboard, Trophy, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Contests', path: '/contests', icon: Trophy },
    { name: 'Profile', path: `/profile/${user?._id}`, icon: UserIcon },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xl tracking-tight transition-transform hover:scale-[1.02]">
              <Terminal className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              <span>Code<span className="text-slate-900 dark:text-white font-extrabold">Sync</span></span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          {isAuthenticated && (
            <div className="hidden md:flex space-x-8 items-center">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 text-sm font-semibold transition-colors py-2 px-3 rounded-lg ${
                      isActive
                        ? 'text-brand-500 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-900/10'
                        : 'text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* Auth & Theme Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-full"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt="avatar"
                    className="h-9 w-9 rounded-full border border-slate-300 dark:border-dark-border"
                  />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border py-1 ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-dark-border">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-dark-muted truncate">{user.email}</p>
                    </div>

                    <Link
                      to={`/profile/${user._id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-hover"
                      onClick={() => setShowDropdown(false)}
                    >
                      <UserIcon className="h-4 w-4" />
                      View Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 text-white py-2 px-4 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-card focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border animate-in slide-in-from-top duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 border-b border-slate-100 dark:border-dark-border mb-2">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-dark-muted truncate">{user.email}</p>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card rounded-lg"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-base font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-4 py-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-sm font-semibold bg-brand-500 text-white py-2 rounded-xl shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
