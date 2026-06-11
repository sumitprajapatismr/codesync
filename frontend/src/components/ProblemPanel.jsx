import React from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';

const ProblemPanel = ({ problem }) => {
  if (!problem) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-dark-muted">
          <BookOpen className="h-5 w-5" />
          <span className="font-bold text-sm">Sandbox Mode</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Workspace Sandbox</h2>
        <p className="text-slate-600 dark:text-dark-muted text-sm mt-3 leading-relaxed">
          You are coding in a freeform sandbox. You can select different programming languages from the dropdown above, write files, and execute scripts using custom input test boxes.
        </p>
        <div className="mt-8 p-4 bg-brand-500/5 dark:bg-brand-900/10 border border-brand-500/10 rounded-2xl">
          <div className="flex gap-2 text-brand-600 dark:text-brand-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-xs font-medium">
              <p className="font-bold">Execution notes:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>Input values typed in the Console tab are passed directly to `stdin`.</li>
                <li>Stderr displays compilation, link, or script execution errors.</li>
                <li>Code changes are backed up on server dynamically.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { title, description, difficulty, constraints, examples, tags } = problem;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border p-6 overflow-y-auto">
      {/* Title */}
      <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h2>
      
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold ${
          difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
          difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
          'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
        }`}>
          {difficulty}
        </span>
        
        {tags && tags.map((tag) => (
          <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-dark-muted">
            {tag}
          </span>
        ))}
      </div>

      {/* Description */}
      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-6">
        {description}
      </div>

      {/* Examples */}
      {examples && examples.length > 0 && (
        <div className="mb-6 space-y-4">
          <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Examples</p>
          {examples.map((ex, index) => (
            <div key={index} className="bg-slate-50 dark:bg-dark-bg/40 border border-slate-100 dark:border-dark-border/40 p-4 rounded-xl space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Example {index + 1}:</p>
              <div className="font-mono text-xs text-slate-600 dark:text-slate-400 pl-2 space-y-1">
                <p><span className="font-semibold text-slate-800 dark:text-slate-200">Input:</span> {ex.input}</p>
                <p><span className="font-semibold text-slate-800 dark:text-slate-200">Output:</span> {ex.output}</p>
                {ex.explanation && <p className="italic"><span className="font-semibold text-slate-800 dark:text-slate-200">Explanation:</span> {ex.explanation}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constraints */}
      {constraints && constraints.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Constraints</p>
          <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            {constraints.map((c, index) => (
              <li key={index}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProblemPanel;
