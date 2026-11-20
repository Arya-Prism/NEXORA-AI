import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low dark:bg-nexora-surface border-t border-outline-variant/20 dark:border-nexora-border mt-16 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-outline-variant/20 dark:border-nexora-border">
          {/* Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-container to-secondary dark:from-nexora-violet dark:to-nexora-cyan flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-headline-md text-base font-bold text-primary dark:text-white">
              NEXORA <span className="text-secondary dark:text-nexora-cyan">AI</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/" className="text-xs text-on-surface-variant dark:text-nexora-muted hover:text-primary dark:hover:text-white transition-colors">
              Overview
            </Link>
            <Link to="/dashboard" className="text-xs text-on-surface-variant dark:text-nexora-muted hover:text-primary dark:hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/planner" className="text-xs text-on-surface-variant dark:text-nexora-muted hover:text-primary dark:hover:text-white transition-colors">
              Smart Planner
            </Link>
            <Link to="/tasks" className="text-xs text-on-surface-variant dark:text-nexora-muted hover:text-primary dark:hover:text-white transition-colors">
              Task Board
            </Link>
            <Link to="/learning" className="text-xs text-on-surface-variant dark:text-nexora-muted hover:text-primary dark:hover:text-white transition-colors">
              Learning Hub
            </Link>
            <Link to="/focus" className="text-xs text-on-surface-variant dark:text-nexora-muted hover:text-primary dark:hover:text-white transition-colors">
              Focus Mode
            </Link>
            <Link to="/analytics" className="text-xs text-on-surface-variant dark:text-nexora-muted hover:text-primary dark:hover:text-white transition-colors">
              Analytics
            </Link>
          </div>
        </div>

        {/* Legal & Disclaimers */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 text-xs text-on-surface-variant dark:text-nexora-muted">
          <p className="text-center md:text-left">
            NEXORA AI combines bio-rhythm tracking, task management, and multimodal intelligence.
          </p>
          <p className="text-center md:text-right">
            © {new Date().getFullYear()} NEXORA AI. Precision Life & Productivity Intelligence.
          </p>
        </div>
      </div>
    </footer>
  );
};
