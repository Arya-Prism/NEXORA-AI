import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { FocusSession } from '../types';
import confetti from 'canvas-confetti';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Flame,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';

export const FocusModePage: React.FC = () => {
  const [selectedDuration, setSelectedDuration] = useState<number>(25 * 60); // seconds
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [stats, setStats] = useState({
    todayFocusMinutes: 0,
    todaySessionsCount: 0,
    totalFocusHours: '0.0',
    totalSessionsCount: 0,
    currentStreakDays: 14,
  });

  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadFocusData();
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleCompleteSession();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const loadFocusData = async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        api.getFocusSessions(10),
        api.getFocusStats(),
      ]);
      setSessions(sessionsRes.sessions);
      setStats(statsRes.stats);
    } catch (err) {
      console.warn('Failed to load focus data:', err);
    }
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration);
  };

  const handleSelectPreset = (minutes: number) => {
    const seconds = minutes * 60;
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
    setIsActive(false);
  };

  const handleCompleteSession = async () => {
    setIsActive(false);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    try {
      const res = await api.recordFocusSession({
        duration: selectedDuration,
        completed: true,
        notes: notes || 'Deep Focus Sprint',
      });
      setSessions(prev => [res.session, ...prev]);
      setNotes('');
      loadFocusData();
    } catch (err) {
      console.warn('Error recording focus session:', err);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((selectedDuration - timeLeft) / selectedDuration) * 100;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Deep Work Rhythm Engine</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary dark:text-white tracking-tight">
            Focus Mode & Pomodoro Intelligence
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant dark:text-nexora-muted mt-1">
            Eliminate cognitive friction. Lock in uninterrupted productivity blocks and sync sessions directly to your analytics.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-surface-container-low dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border text-center">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-nexora-muted">Streak</span>
            <p className="text-sm font-bold text-amber-500">🔥 {stats.currentStreakDays} Days</p>
          </div>
          <div className="p-3 rounded-2xl bg-surface-container-low dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border text-center">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-nexora-muted">Today</span>
            <p className="text-sm font-bold text-secondary dark:text-nexora-cyan">{stats.todayFocusMinutes} mins</p>
          </div>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Timer Control Card (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
          {/* Preset Chips */}
          <div className="flex items-center gap-2 mb-8">
            {[
              { label: '25m Sprint', min: 25 },
              { label: '50m Deep Work', min: 50 },
              { label: '15m Micro', min: 15 },
            ].map(preset => {
              const isSelected = selectedDuration === preset.min * 60;
              return (
                <button
                  key={preset.min}
                  onClick={() => handleSelectPreset(preset.min)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-primary-container text-on-primary dark:bg-nexora-violet dark:text-white border-transparent shadow-xs'
                      : 'bg-surface-container-low dark:bg-nexora-card text-on-surface-variant dark:text-nexora-muted border-outline-variant/20 hover:bg-surface-container'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Circular Countdown Display */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-surface-container dark:text-slate-800"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
              <circle
                className="text-secondary dark:text-nexora-cyan transition-all duration-1000 ease-linear"
                strokeWidth="6"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-metric-num text-4xl sm:text-5xl font-extrabold text-primary dark:text-white tracking-tight">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary dark:text-nexora-cyan mt-1">
                {isActive ? 'In Sprint' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleStartPause}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary-container text-on-primary dark:bg-gradient-to-r dark:from-nexora-violet dark:to-nexora-violet-glow font-bold text-sm shadow-lg hover:bg-primary transition-all active:scale-95"
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isActive ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-nexora-card text-on-surface-variant dark:text-nexora-muted hover:text-primary dark:hover:text-white hover:bg-surface-container transition-colors border border-outline-variant/20"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Session Notes Input */}
          <div className="w-full max-w-sm">
            <input
              type="text"
              placeholder="What are you focusing on during this sprint?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary text-center"
            />
          </div>
        </div>

        {/* Right Column: Session History & Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-sm font-bold text-primary dark:text-white uppercase tracking-wider">
              Recent Focus Sprints
            </h2>
            <span className="text-xs text-outline">Total: {stats.totalSessionsCount}</span>
          </div>

          <div className="rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm p-5 space-y-3">
            {sessions.length === 0 ? (
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted text-center py-6">
                No focus sessions recorded yet. Start your first sprint!
              </p>
            ) : (
              sessions.map(s => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-nexora-card border border-outline-variant/20 dark:border-nexora-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary/15 dark:bg-nexora-cyan/20 flex items-center justify-center text-secondary dark:text-nexora-cyan">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary dark:text-white">
                        {Math.round(s.duration / 60)} min Focus Block
                      </p>
                      <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted line-clamp-1">
                        {s.notes || 'Deep focus sprint'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-outline">
                    {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
