import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AnalyticsSummary } from '../types';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Brain,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.getAnalyticsDashboard();
      setData(res.analytics);
    } catch (err) {
      console.warn('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-16 text-center">
        <Sparkles className="w-8 h-8 text-secondary dark:text-nexora-cyan animate-spin mx-auto mb-3" />
        <p className="text-xs text-on-surface-variant dark:text-nexora-muted">Compiling real intelligence metrics...</p>
      </div>
    );
  }

  const maxWeeklyMinutes = Math.max(...data.focus.weeklyDistribution.map(d => d.minutes), 60);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high dark:bg-nexora-surface text-primary dark:text-nexora-cyan text-[11px] font-bold uppercase tracking-widest mb-2 shadow-xs">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-Time Database Telemetry</span>
        </div>
        <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary dark:text-white tracking-tight">
          Performance & Productivity Analytics
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant dark:text-nexora-muted mt-1">
          Quantitative analysis computed across your tasks, goals, focus sprints, and learning curriculum.
        </p>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-nexora-muted">
              Task Completion
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-num text-3xl font-extrabold text-primary dark:text-white">
              {data.tasks.completionRate}%
            </span>
            <span className="text-xs text-on-surface-variant dark:text-nexora-muted">
              ({data.tasks.completed}/{data.tasks.total})
            </span>
          </div>
          <div className="w-full bg-surface-container dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${data.tasks.completionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-nexora-muted">
              Total Focus Time
            </span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-num text-3xl font-extrabold text-primary dark:text-white">
              {data.focus.totalHours} hrs
            </span>
            <span className="text-xs text-on-surface-variant dark:text-nexora-muted">
              ({data.focus.sessionsCount} sprints)
            </span>
          </div>
          <p className="text-[11px] text-secondary dark:text-nexora-cyan mt-3 font-semibold">
            {data.focus.totalMinutes} total minutes in flow
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-nexora-muted">
              Active Goals Progress
            </span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-num text-3xl font-extrabold text-primary dark:text-white">
              {data.goals.averageProgress}%
            </span>
            <span className="text-xs text-on-surface-variant dark:text-nexora-muted">
              ({data.goals.active} active)
            </span>
          </div>
          <div className="w-full bg-surface-container dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${data.goals.averageProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-nexora-muted">
              Curriculum Mastery
            </span>
            <Brain className="w-4 h-4 text-secondary dark:text-nexora-cyan" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-num text-3xl font-extrabold text-primary dark:text-white">
              {data.learning.averageProgress}%
            </span>
            <span className="text-xs text-on-surface-variant dark:text-nexora-muted">
              ({data.learning.completedLessonsCount} lessons)
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted mt-3">
            Across {data.learning.topicsCount} specialized domains
          </p>
        </div>
      </div>

      {/* Main Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Weekly Productivity Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headline-md text-sm font-bold text-primary dark:text-white uppercase tracking-wider">
                Weekly Productivity (Focus Minutes)
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-0.5">
                Daily distribution of logged Pomodoro and deep work blocks
              </p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {data.focus.weeklyDistribution.map((item, idx) => {
              const heightPercent = Math.max((item.minutes / maxWeeklyMinutes) * 100, 8);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-primary dark:text-white">{item.minutes}m</span>
                  <div className="w-full bg-surface-container dark:bg-slate-800 rounded-t-xl h-full flex items-end">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-secondary to-secondary-container dark:from-nexora-violet dark:to-nexora-cyan transition-all duration-700"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-semibold text-on-surface-variant dark:text-nexora-muted">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Unified Activity Feed (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
          <h2 className="font-headline-md text-sm font-bold text-primary dark:text-white uppercase tracking-wider mb-4">
            Recent Intelligence Activity
          </h2>

          <div className="space-y-3">
            {data.recentActivity.length === 0 ? (
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted text-center py-6">
                No recent activity recorded yet.
              </p>
            ) : (
              data.recentActivity.map(act => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-nexora-card border border-outline-variant/20 dark:border-nexora-border flex items-start gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-secondary dark:bg-nexora-cyan mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-xs font-semibold text-primary dark:text-white">{act.title}</p>
                    <span className="text-[10px] text-outline mt-0.5 block">{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
