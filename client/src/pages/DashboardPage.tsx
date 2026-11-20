import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ScheduleItem, Task, AnalyticsSummary } from '../types';
import {
  Flame,
  Droplet,
  Dumbbell,
  Clock,
  Sparkles,
  Camera,
  Download,
  Plus,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loggedGlasses, setLoggedGlasses] = useState<number>(6);
  const [isWaterLoading, setIsWaterLoading] = useState(false);
  const maxGlasses = 8;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [schedRes, taskRes, analyticsRes] = await Promise.allSettled([
        api.getSchedules({ date: today }),
        api.getTasks(),
        api.getAnalyticsDashboard(),
      ]);

      if (schedRes.status === 'fulfilled') setSchedules(schedRes.value.schedules);
      if (taskRes.status === 'fulfilled') setTasks(taskRes.value.tasks);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.analytics);
    } catch (err) {
      console.warn('Dashboard fetch error, using stored baseline:', err);
    }
  };

  const handleAddWater = () => {
    if (loggedGlasses < maxGlasses) {
      setLoggedGlasses(prev => prev + 1);
    }
  };

  const handleResetWater = () => {
    setLoggedGlasses(0);
  };

  const currentMl = Math.round((loggedGlasses / maxGlasses) * 2800);
  const currentLiters = (currentMl / 1000).toFixed(1);

  const handleDownloadReport = () => {
    const reportContent = `NEXORA AI - Weekly Performance Report
Generated: ${new Date().toLocaleString()}
User: ${user?.full_name || 'Alex Rivera'}

Tasks Summary:
- Total Tasks: ${analytics?.tasks.total || tasks.length}
- Completed: ${analytics?.tasks.completed || tasks.filter(t => t.status === 'completed').length}
- Completion Rate: ${analytics?.tasks.completionRate || 75}%

Focus Hours: ${analytics?.focus.totalHours || '3.5'} hrs
Hydration: ${currentLiters}L / 2.8L
Habit Streak: 14 Days (Emerald Tier)
`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexora_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      {/* Top Ambient Greeting Banner from Stitch */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low dark:bg-nexora-surface p-6 md:p-8 border border-outline-variant/30 dark:border-nexora-border shadow-sm mb-8">
        <div className="absolute -right-16 -top-24 w-80 h-80 rounded-full bg-secondary-fixed/30 dark:bg-nexora-violet/20 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-20 w-64 h-64 rounded-full bg-surface-container-high/40 dark:bg-nexora-cyan/15 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/90 dark:bg-nexora-bg/90 text-secondary dark:text-nexora-cyan text-xs font-semibold shadow-sm mb-3">
              <span className="w-2 h-2 rounded-full bg-secondary dark:bg-nexora-cyan animate-pulse"></span>
              <span>Metabolic & Intelligence Engine Active · Synchronized</span>
            </div>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary dark:text-white tracking-tight">
              Good afternoon, {user?.full_name?.split(' ')[0] || 'Alex'}! 🌿
            </h1>
            <p className="font-body-lg text-sm md:text-base text-on-surface-variant dark:text-nexora-muted mt-1">
              You are <span className="font-bold text-primary dark:text-white">74%</span> toward your daily protein target and have completed <span className="font-bold text-secondary dark:text-nexora-cyan">3 focus blocks</span>.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/analyzer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary dark:bg-gradient-to-r dark:from-nexora-violet dark:to-nexora-violet-glow rounded-xl text-xs font-semibold shadow-md hover:bg-primary transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Quick Scan Meal / Doc</span>
            </Link>
            <button
              onClick={handleAddWater}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest dark:bg-nexora-bg text-primary dark:text-white rounded-xl text-xs font-semibold border border-outline-variant/30 dark:border-nexora-border shadow-sm hover:bg-surface-container-high dark:hover:bg-nexora-card transition-all"
            >
              <Droplet className="w-4 h-4 text-secondary dark:text-nexora-cyan" />
              <span>+ Log Water (250ml)</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest/60 dark:bg-nexora-card text-on-surface-variant dark:text-nexora-muted rounded-xl text-xs font-semibold hover:bg-surface-container-lowest dark:hover:text-white transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Weekly Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Metric Glassmorphic Cards from Stitch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Metric 1: Calories / Metabolic Budget */}
        <div className="relative bg-surface-container-lowest/90 dark:bg-nexora-surface/90 backdrop-blur-md rounded-3xl p-6 border border-outline-variant/30 dark:border-nexora-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-nexora-muted">
              Caloric Budget
            </span>
            <span className="p-2 rounded-xl bg-surface-container dark:bg-nexora-card text-primary dark:text-amber-400">
              <Flame className="w-4 h-4 text-amber-500" />
            </span>
          </div>

          <div className="flex items-center justify-between my-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-metric-num text-2xl font-bold text-primary dark:text-white">1,640</span>
                <span className="text-xs text-on-surface-variant dark:text-nexora-muted">/ 2,200</span>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-1">
                <span className="text-secondary dark:text-nexora-cyan font-bold">560 kcal</span> remaining
              </p>
            </div>

            {/* SVG Circular Gauge */}
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container dark:text-slate-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-secondary dark:text-nexora-cyan"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="75, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary dark:text-white">
                75%
              </div>
            </div>
          </div>

          <div className="w-full bg-surface-container dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-secondary dark:bg-nexora-cyan h-full rounded-full w-3/4"></div>
          </div>
        </div>

        {/* Metric 2: Protein / Nutrient Target */}
        <div className="relative bg-surface-container-lowest/90 dark:bg-nexora-surface/90 backdrop-blur-md rounded-3xl p-6 border border-outline-variant/30 dark:border-nexora-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-nexora-muted">
              Macro Target: Protein
            </span>
            <span className="p-2 rounded-xl bg-surface-container dark:bg-nexora-card text-secondary dark:text-nexora-cyan">
              <Dumbbell className="w-4 h-4" />
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-1">
              <span className="font-metric-num text-2xl font-bold text-primary dark:text-white">98g</span>
              <span className="text-xs text-on-surface-variant dark:text-nexora-muted">/ 130g target</span>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-1">
              32g needed to close recovery threshold
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant dark:text-nexora-muted mb-1">
              <span>75% Achieved</span>
              <span className="text-secondary dark:text-nexora-cyan font-bold">Emerald Tier</span>
            </div>
            <div className="w-full bg-surface-container dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-secondary-fixed-dim to-secondary dark:from-nexora-violet dark:to-nexora-cyan h-full rounded-full w-[75%]"></div>
            </div>
          </div>
        </div>

        {/* Metric 3: Hydration Micro-Tracker */}
        <div className="relative bg-surface-container-lowest/90 dark:bg-nexora-surface/90 backdrop-blur-md rounded-3xl p-6 border border-outline-variant/30 dark:border-nexora-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-nexora-muted">
              Hydration Rhythm
            </span>
            <span className="p-2 rounded-xl bg-surface-container dark:bg-nexora-card text-blue-500">
              <Droplet className="w-4 h-4" />
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-1">
              <span className="font-metric-num text-2xl font-bold text-primary dark:text-white">{currentLiters}L</span>
              <span className="text-xs text-on-surface-variant dark:text-nexora-muted">/ 2.8L target</span>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-1">
              {loggedGlasses} of {maxGlasses} micro-portions logged
            </p>
          </div>

          <div className="flex items-center justify-between gap-1 pt-1">
            {[...Array(maxGlasses)].map((_, i) => (
              <button
                key={i}
                onClick={() => setLoggedGlasses(i + 1)}
                className={`h-6 flex-1 rounded-md transition-colors ${
                  i < loggedGlasses
                    ? 'bg-secondary dark:bg-nexora-cyan shadow-xs'
                    : 'bg-surface-container dark:bg-slate-800'
                }`}
                title={`Glass ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Metric 4: Focus & Deep Work Hours */}
        <div className="relative bg-surface-container-lowest/90 dark:bg-nexora-surface/90 backdrop-blur-md rounded-3xl p-6 border border-outline-variant/30 dark:border-nexora-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-nexora-muted">
              Daily Focus Time
            </span>
            <span className="p-2 rounded-xl bg-surface-container dark:bg-nexora-card text-indigo-500">
              <Clock className="w-4 h-4" />
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-1">
              <span className="font-metric-num text-2xl font-bold text-primary dark:text-white">
                {analytics?.focus.totalMinutes ? Math.round(analytics.focus.totalMinutes / 60) : '3'}h 15m
              </span>
              <span className="text-xs text-on-surface-variant dark:text-nexora-muted">/ 4h target</span>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-1">
              {analytics?.focus.sessionsCount || 3} deep work blocks completed
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant dark:text-nexora-muted mb-1">
              <span>81% Sprinted</span>
              <Link to="/focus" className="text-secondary dark:text-nexora-cyan font-bold hover:underline">
                Start Sprint →
              </Link>
            </div>
            <div className="w-full bg-surface-container dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-[81%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Smart Schedule + Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Today's Smart Schedule */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary dark:text-nexora-cyan" />
              <h2 className="font-headline-md text-lg font-bold text-primary dark:text-white">
                Today's Synchronized Schedule
              </h2>
            </div>
            <Link
              to="/planner"
              className="text-xs font-semibold text-secondary dark:text-nexora-cyan hover:underline flex items-center gap-1"
            >
              <span>Weekly Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm p-5 space-y-3">
            {schedules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-on-surface-variant dark:text-nexora-muted">No schedule items for today.</p>
                <Link
                  to="/planner"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-on-primary rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Schedule with AI</span>
                </Link>
              </div>
            ) : (
              schedules.slice(0, 4).map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-low dark:bg-nexora-card border border-outline-variant/20 dark:border-nexora-border hover:bg-surface-container dark:hover:bg-nexora-card-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-10 rounded-full bg-secondary dark:bg-nexora-cyan shrink-0"></div>
                    <div>
                      <p className="text-xs font-bold text-primary dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted">
                        {item.start_time} - {item.end_time} · <span className="capitalize">{item.category}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-container-lowest dark:bg-nexora-bg text-secondary dark:text-nexora-cyan">
                    {item.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 Columns: Tasks & Priorities */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary dark:text-nexora-violet" />
              <h2 className="font-headline-md text-lg font-bold text-primary dark:text-white">
                Active Priorities
              </h2>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-secondary dark:text-nexora-cyan hover:underline flex items-center gap-1"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm p-5 space-y-3">
            {tasks.slice(0, 4).map(t => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-nexora-card border border-outline-variant/20 dark:border-nexora-border flex items-start justify-between gap-2"
              >
                <div>
                  <p className={`text-xs font-bold ${t.status === 'completed' ? 'line-through text-outline' : 'text-primary dark:text-white'}`}>
                    {t.title}
                  </p>
                  <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted line-clamp-1 mt-0.5">
                    {t.description || 'No description added'}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    t.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : t.priority === 'high'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
