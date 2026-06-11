import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Users, Play, Code, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Real-Time Sync',
      desc: 'Collaborate with ultra-low latency. See cursors, selections, and code changes instantly.',
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'Monaco Editor',
      desc: 'Get the full VS Code power in your browser: autocomplete, syntax highlight, themes.',
      icon: Code,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: 'Live Chat',
      desc: 'Discuss problems and strategies through built-in text chat, typing statuses, and logs.',
      icon: Users,
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      title: 'Online Execution',
      desc: 'Compile and run solutions immediately using Judge0 API across 4 popular languages.',
      icon: Play,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Interview Mode',
      desc: 'Structure mock interview sessions, observe candidate actions, and review logs.',
      icon: ShieldCheck,
      color: 'text-rose-500 bg-rose-500/10',
    },
    {
      title: 'Coding Contests',
      desc: 'Compete in countdown-timed contests with live, rating-calculated leaderboards.',
      icon: Terminal,
      color: 'text-sky-500 bg-sky-500/10',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-brand-500/20 to-emerald-500/10 blur-3xl opacity-30 dark:opacity-20 pointer-events-none rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 text-xs font-semibold text-brand-600 dark:text-brand-400 mb-6 shadow-sm">
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Real-time technical interview prep</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Practice coding interviews with your peers in{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-emerald-400">
              real time
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-dark-muted max-w-2xl mx-auto">
            CodeSync bridges collaborative programming and live online compilation. Set up coding rooms, join contests, and coordinate coding interviews seamlessly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group"
                >
                  Start Syncing Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-hover font-semibold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white dark:bg-dark-card border-y border-slate-200 dark:border-dark-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why developers love CodeSync</h2>
            <p className="mt-4 text-slate-600 dark:text-dark-muted max-w-xl mx-auto">
              A comprehensive toolkit engineered specifically for collaborative problem solving and standard engineering interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40 bg-slate-50/50 dark:bg-dark-bg/30 hover:border-brand-500/30 dark:hover:border-brand-400/30 hover:shadow-lg dark:hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className={`p-3 rounded-xl w-fit ${feature.color} mb-5`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-dark-muted text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center bg-slate-50 dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-600 to-emerald-600 rounded-3xl p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
          <h2 className="text-3xl font-extrabold mb-4">Ready to prepare together?</h2>
          <p className="text-brand-100 mb-8 max-w-lg mx-auto">
            Create a collaborative sandbox in seconds. Share the invite link, launch Monaco editor, and start cracking the code.
          </p>
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
