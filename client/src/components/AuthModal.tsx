import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register, quickDemoLogin, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        if (!fullName.trim()) throw new Error('Please enter your full name');
        await register(email, password, fullName);
      } else {
        // Reset password
        setSuccessMsg('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-2xl p-6 md:p-8 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-secondary/15 dark:bg-nexora-cyan/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container dark:hover:bg-nexora-card transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-container to-secondary dark:from-nexora-violet dark:to-nexora-cyan flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-headline-md text-base font-bold text-primary dark:text-white">
            NEXORA AI
          </span>
        </div>

        <h2 className="font-headline-md text-xl font-bold text-primary dark:text-white mt-1">
          {mode === 'login' && 'Welcome Back'}
          {mode === 'register' && 'Create Your Intelligence Account'}
          {mode === 'reset' && 'Reset Password'}
        </h2>
        <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-1 mb-6">
          {mode === 'login' && 'Sign in to access your synchronized schedules, tasks, and AI roadmaps.'}
          {mode === 'register' && 'Start organizing your productivity, focus sessions, and learning.'}
          {mode === 'reset' && 'Enter your registered email address to receive reset instructions.'}
        </p>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container/30 border border-error/20 text-error text-xs font-medium">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-secondary-container/30 border border-secondary/20 text-on-secondary-fixed-variant dark:text-nexora-cyan text-xs font-medium">
            {successMsg}
          </div>
        )}

        {/* One-Click Demo Mode Button */}
        <button
          type="button"
          onClick={quickDemoLogin}
          className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-nexora-card border border-secondary/30 dark:border-nexora-cyan/30 text-secondary dark:text-nexora-cyan hover:bg-surface-container dark:hover:bg-nexora-card-hover font-semibold text-xs shadow-sm transition-all"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>One-Click Instant Demo Access (Alex Rivera)</span>
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-outline-variant/30 dark:border-nexora-border"></div>
          <span className="flex-shrink mx-3 text-[10px] text-outline uppercase tracking-wider font-semibold">Or with Email</span>
          <div className="flex-grow border-t border-outline-variant/30 dark:border-nexora-border"></div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-primary dark:text-white mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-outline" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-nexora-violet"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-primary dark:text-white mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-outline" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-nexora-violet"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-primary dark:text-white">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[10px] text-secondary dark:text-nexora-cyan hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-outline" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-nexora-violet"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-container text-on-primary dark:bg-gradient-to-r dark:from-nexora-violet dark:to-nexora-violet-glow font-semibold text-xs shadow-md hover:opacity-95 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to NEXORA'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'reset' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Mode Switch */}
        <div className="mt-5 text-center text-xs text-on-surface-variant dark:text-nexora-muted">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-semibold text-secondary dark:text-nexora-cyan hover:underline"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-secondary dark:text-nexora-cyan hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
