import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-200 dark:bg-dark-border hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-500 animate-pulse" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
