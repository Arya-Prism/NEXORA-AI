import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ScheduleItem } from '../types';
import {
  Calendar,
  Sparkles,
  Download,
  Plus,
  Clock,
  DollarSign,
  Trash2,
  CheckCircle2,
  Filter,
  X,
  Flame,
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>(['budget', 'time', 'protein']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newCategory, setNewCategory] = useState<'work' | 'study' | 'health' | 'personal' | 'focus'>('work');

  const days = [
    { label: 'Mon', date: 'Oct 23', fullDate: '2026-10-23' },
    { label: 'Tue', date: 'Oct 24', fullDate: '2026-10-24' },
    { label: 'Wed', date: 'Oct 25', fullDate: '2026-10-25' },
    { label: 'Thu', date: 'Oct 26', fullDate: '2026-10-26' },
    { label: 'Fri', date: 'Oct 27', fullDate: '2026-10-27' },
    { label: 'Sat', date: 'Oct 28', fullDate: '2026-10-28' },
    { label: 'Sun', date: 'Oct 29', fullDate: '2026-10-29' },
  ];

  const selectedDate = days[selectedDayIndex].fullDate;

  useEffect(() => {
    loadSchedules();
  }, [selectedDate]);

  const loadSchedules = async () => {
    try {
      const res = await api.getSchedules();
      setSchedules(res.schedules);
    } catch (err) {
      console.warn('Failed to fetch schedules:', err);
    }
  };

  const toggleFilter = (key: string) => {
    setActiveFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleGenerateAiPlan = async () => {
    setIsGenerating(true);
    try {
      const res = await api.suggestAiSchedule({
        preferences: activeFilters.join(', '),
        targetDate: selectedDate,
      });
      setSchedules(prev => [...prev, ...res.schedules]);
    } catch (err: any) {
      alert('AI plan error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.createSchedule({
        title: newTitle,
        start_time: newStartTime,
        end_time: newEndTime,
        date: selectedDate,
        category: newCategory,
      });
      setSchedules(prev => [...prev, res.schedule]);
      setIsAddModalOpen(false);
      setNewTitle('');
    } catch (err: any) {
      alert('Error creating schedule: ' + err.message);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await api.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handleExportPlan = () => {
    const text = `NEXORA AI - Smart Schedule & Nutrition Plan (${days[selectedDayIndex].date})
==============================================================
Date: ${selectedDate}

Schedules:
${schedules
  .filter(s => s.date === selectedDate || !s.date)
  .map(s => `- [${s.start_time} - ${s.end_time}] ${s.title} (${s.category})`)
  .join('\n')}

Active Filters: ${activeFilters.join(', ')}
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexora_Schedule_${selectedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const daySchedules = schedules.filter(s => s.date === selectedDate || !s.date);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      {/* Header & Controls from Stitch */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high dark:bg-nexora-surface text-primary dark:text-nexora-cyan text-[11px] font-bold uppercase tracking-widest mb-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-secondary dark:bg-nexora-cyan animate-pulse"></span>
            <span>Metabolic AI Engine Active</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary dark:text-white tracking-tight">
            Smart Weekly Planner & Kitchen Assistant
          </h1>
          <p className="text-sm text-on-surface-variant dark:text-nexora-muted mt-1">
            Personalized deep work blocks, study routines, and meals calibrated to your schedule, budget, and protein goals.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleExportPlan}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-nexora-card text-primary dark:text-white text-xs font-semibold hover:bg-surface-container dark:hover:bg-nexora-card-hover transition-all shadow-xs border border-outline-variant/30 dark:border-nexora-border"
          >
            <Download className="w-4 h-4 text-secondary dark:text-nexora-cyan" />
            <span>Export Grocery & Plan</span>
          </button>
          <button
            onClick={handleGenerateAiPlan}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary dark:bg-gradient-to-r dark:from-nexora-violet dark:to-nexora-violet-glow text-xs font-semibold shadow-md hover:bg-primary transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating AI Plan...' : 'Generate New Weekly Plan'}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-secondary dark:bg-nexora-cyan text-white dark:text-nexora-bg text-xs font-semibold shadow hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Filter & Preference Chips Track from Stitch */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary dark:bg-nexora-violet text-xs font-semibold shadow-xs">
          <Filter className="w-3.5 h-3.5" />
          <span>Active Filters:</span>
        </div>

        {[
          { key: 'budget', label: 'Budget-Friendly (<$6/meal)', icon: DollarSign },
          { key: 'time', label: 'Prep Time < 20 mins', icon: Clock },
          { key: 'protein', label: 'High Protein (110g+)', icon: Flame },
          { key: 'dorm', label: 'Dorm / Minimal Cookware', icon: CheckCircle2 },
          { key: 'gluten_free', label: 'Gluten-Free Only', icon: CheckCircle2 },
        ].map(filter => {
          const isActive = activeFilters.includes(filter.key);
          const Icon = filter.icon;
          return (
            <button
              key={filter.key}
              onClick={() => toggleFilter(filter.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                isActive
                  ? 'bg-surface-container-lowest dark:bg-nexora-surface text-primary dark:text-white border-secondary dark:border-nexora-cyan shadow-xs'
                  : 'bg-surface-container-low dark:bg-nexora-bg text-on-surface-variant dark:text-nexora-muted border-outline-variant/20 dark:border-nexora-border hover:bg-surface-container'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-secondary dark:text-nexora-cyan' : ''}`} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Weekly Interactive Calendar Strip */}
      <div className="grid grid-cols-7 gap-2 md:gap-3 mb-8">
        {days.map((d, index) => {
          const isSelected = selectedDayIndex === index;
          return (
            <button
              key={d.label}
              onClick={() => setSelectedDayIndex(index)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all border ${
                isSelected
                  ? 'bg-primary-container text-on-primary dark:bg-nexora-violet dark:text-white border-transparent shadow-md scale-102'
                  : 'bg-surface-container-lowest dark:bg-nexora-surface text-on-surface-variant dark:text-nexora-muted border-outline-variant/30 dark:border-nexora-border hover:bg-surface-container-high'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider">{d.label}</span>
              <span className="text-xs md:text-sm font-extrabold mt-0.5">{d.date.split(' ')[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Schedule Items Grid */}
      <div className="space-y-4">
        {daySchedules.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border p-8">
            <Calendar className="w-10 h-10 text-outline mx-auto mb-3" />
            <p className="text-sm font-semibold text-primary dark:text-white">
              No schedule items recorded for {days[selectedDayIndex].label}, {days[selectedDayIndex].date}.
            </p>
            <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-1 max-w-sm mx-auto">
              Click "Generate New Weekly Plan" to have NEXORA AI automatically schedule optimal meals and deep work blocks.
            </p>
          </div>
        ) : (
          daySchedules.map(item => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    item.category === 'health'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : item.category === 'work'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : item.category === 'study'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline-md text-sm md:text-base font-bold text-primary dark:text-white">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant dark:text-nexora-muted">
                    <span className="font-semibold text-primary dark:text-white">
                      {item.start_time} - {item.end_time}
                    </span>
                    <span>•</span>
                    <span className="capitalize px-2 py-0.5 rounded-full bg-surface-container-low dark:bg-nexora-card text-[10px] font-bold">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => handleDeleteSchedule(item.id)}
                  className="p-2 text-outline hover:text-error hover:bg-error-container/20 rounded-xl transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-2xl p-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-on-surface-variant hover:bg-surface-container"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-headline-md text-lg font-bold text-primary dark:text-white mb-4">
              Add Schedule Event
            </h3>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary dark:text-white mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Work: System Architecture Sprint"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-primary dark:text-white mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary dark:text-white mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary dark:text-white mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white"
                >
                  <option value="work">Work / Engineering</option>
                  <option value="study">Study / Academic</option>
                  <option value="health">Health / Nutrition</option>
                  <option value="personal">Personal / Leisure</option>
                  <option value="focus">Deep Focus Block</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary dark:bg-nexora-violet font-semibold text-xs shadow hover:bg-primary transition-all"
              >
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
