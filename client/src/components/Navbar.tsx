import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  Moon,
  Sun,
  Bell,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Calendar,
  Flame,
  Brain,
  FileText,
  Timer,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Analyzer', path: '/analyzer' },
    { name: 'Planner', path: '/planner' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'AI Chat', path: '/assistant' },
    { name: 'Learning', path: '/learning' },
    { name: 'Focus Timer', path: '/focus' },
    { name: 'Analytics', path: '/analytics' },
  ];

  const notifications = [
    { id: 1, title: 'AI Daily Plan Ready', text: 'Optimized schedule for today generated.', time: '10m ago' },
    { id: 2, title: 'Focus Streak Milestone', text: '14 days consistent habit achievement!', time: '1h ago' },
    { id: 3, title: 'Hydration Target', text: 'Drink 250ml water to maintain recovery tier.', time: '2h ago' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 dark:bg-nexora-bg/90 backdrop-blur-xl border-b border-outline-variant/30 dark:border-nexora-border shadow-sm transition-colors duration-200">
      <div className="h-16 w-full max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-container to-secondary dark:from-nexora-violet dark:to-nexora-cyan flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-lg md:text-xl font-bold text-primary dark:text-white tracking-tight">
                NEXORA <span className="text-secondary dark:text-nexora-cyan">AI</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] text-on-surface-variant dark:text-nexora-muted font-medium tracking-wider uppercase -mt-1">
                Life Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 p-1 bg-surface-container-low dark:bg-nexora-surface/80 rounded-2xl border border-outline-variant/20 dark:border-nexora-border">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-container text-on-primary dark:bg-nexora-violet dark:text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:text-nexora-muted dark:hover:text-white dark:hover:bg-nexora-card-hover'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Mode Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === 'emerald' ? 'Switch to Midnight Cyber Mode' : 'Switch to Organic Emerald Mode'}
            className="p-2 rounded-xl text-on-surface-variant dark:text-nexora-muted hover:text-on-surface dark:hover:text-white hover:bg-surface-container dark:hover:bg-nexora-surface transition-colors"
          >
            {theme === 'emerald' ? (
              <Moon className="w-4 h-4 text-primary" />
            ) : (
              <Sun className="w-4 h-4 text-nexora-cyan" />
            )}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-xl text-on-surface-variant dark:text-nexora-muted hover:text-on-surface dark:hover:text-white hover:bg-surface-container dark:hover:bg-nexora-surface transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary dark:bg-nexora-cyan ring-2 ring-surface-container-lowest dark:ring-nexora-bg animate-pulse"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 dark:border-nexora-border">
                  <span className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="text-[10px] text-secondary dark:text-nexora-cyan font-medium">3 unread</span>
                </div>
                <div className="divide-y divide-outline-variant/10 dark:divide-nexora-border">
                  {notifications.map(n => (
                    <div key={n.id} className="py-2.5 hover:bg-surface-container-low dark:hover:bg-nexora-card px-2 rounded-xl transition-colors">
                      <p className="text-xs font-semibold text-primary dark:text-white">{n.title}</p>
                      <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted">{n.text}</p>
                      <span className="text-[9px] text-outline dark:text-slate-500 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Action / Assistant Trigger */}
          <Link
            to="/assistant"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-container text-on-primary dark:bg-gradient-to-r dark:from-nexora-violet dark:to-nexora-violet-glow rounded-full text-xs font-semibold shadow-md hover:bg-primary transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </Link>

          {/* User Profile / Auth Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-surface-container-low dark:bg-nexora-surface hover:bg-surface-container dark:hover:bg-nexora-card border border-outline-variant/20 dark:border-nexora-border transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                  alt={user.full_name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-primary/20 dark:ring-nexora-cyan"
                />
                <span className="hidden md:inline-block text-xs font-semibold text-on-surface dark:text-white max-w-[100px] truncate">
                  {user.full_name || 'Alex'}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-outline-variant/20 dark:border-nexora-border">
                    <p className="text-xs font-bold text-primary dark:text-white truncate">{user.full_name}</p>
                    <p className="text-[10px] text-on-surface-variant dark:text-nexora-muted truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-on-surface dark:text-nexora-text hover:bg-surface-container-low dark:hover:bg-nexora-card rounded-xl transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>My Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-error-container/20 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-container text-on-primary dark:bg-nexora-violet rounded-full text-xs font-semibold shadow hover:bg-primary transition-all"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-on-surface-variant dark:text-nexora-muted hover:text-on-surface dark:hover:text-white hover:bg-surface-container dark:hover:bg-nexora-surface"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-surface-container-lowest/95 dark:bg-nexora-bg/95 backdrop-blur-2xl border-b border-outline-variant/30 dark:border-nexora-border px-4 py-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-container text-on-primary dark:bg-nexora-violet dark:text-white'
                  : 'text-on-surface-variant dark:text-nexora-muted hover:bg-surface-container-low dark:hover:bg-nexora-card'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
