import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg transition-colors py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-dark-muted">
            &copy; {new Date().getFullYear()} CodeSync. Built for collaborative coding interviews.
          </p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-dark-muted">
            <a href="#" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
