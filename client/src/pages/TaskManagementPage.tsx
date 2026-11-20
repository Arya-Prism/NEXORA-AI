import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Task } from '../types';
import {
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Trash2,
  ArrowRight,
  AlertCircle,
  Calendar,
  X,
} from 'lucide-react';

export const TaskManagementPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadTasks();
  }, [priorityFilter]);

  const loadTasks = async () => {
    try {
      const res = await api.getTasks({
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      });
      setTasks(res.tasks);
    } catch (err) {
      console.warn('Failed to load tasks:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await api.createTask({
        title,
        description,
        priority,
        status,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });
      setTasks(prev => [res.task, ...prev]);
      setIsAddModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      alert('Error creating task: ' + err.message);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      alert('Error deleting task: ' + err.message);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300';
      case 'high':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300';
      case 'medium':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300';
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary dark:text-white tracking-tight">
            Task Management Board
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant dark:text-nexora-muted mt-1">
            Organize, prioritize, and track tasks across To-do, In Progress, and Completed states.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary dark:bg-gradient-to-r dark:from-nexora-violet dark:to-nexora-violet-glow text-xs font-semibold shadow-md hover:bg-primary transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-surface-container-low dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-container-lowest dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-medium text-on-surface-variant dark:text-nexora-muted">Priority:</span>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-lowest dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: To-Do */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <h2 className="font-headline-md text-sm font-bold text-primary dark:text-white uppercase tracking-wider">
                To-Do
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-nexora-card text-xs font-bold text-on-surface-variant dark:text-nexora-muted">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[300px] p-2 rounded-3xl bg-surface-container-low/60 dark:bg-nexora-card/40 border border-outline-variant/20 dark:border-nexora-border">
            {todoTasks.map(t => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-xs hover:shadow-md transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(t.priority)}`}>
                    {t.priority}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="text-outline hover:text-error transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-headline-md text-xs font-bold text-primary dark:text-white">{t.title}</h3>
                {t.description && (
                  <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted line-clamp-2">
                    {t.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 dark:border-nexora-border text-[10px] text-outline">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No date'}
                  </span>
                  <button
                    onClick={() => handleStatusChange(t.id, 'in_progress')}
                    className="inline-flex items-center gap-1 text-secondary dark:text-nexora-cyan font-semibold hover:underline"
                  >
                    <span>Start</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="font-headline-md text-sm font-bold text-primary dark:text-white uppercase tracking-wider">
                In Progress
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-nexora-card text-xs font-bold text-on-surface-variant dark:text-nexora-muted">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[300px] p-2 rounded-3xl bg-surface-container-low/60 dark:bg-nexora-card/40 border border-outline-variant/20 dark:border-nexora-border">
            {inProgressTasks.map(t => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-xs hover:shadow-md transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(t.priority)}`}>
                    {t.priority}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="text-outline hover:text-error transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-headline-md text-xs font-bold text-primary dark:text-white">{t.title}</h3>
                {t.description && (
                  <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted line-clamp-2">
                    {t.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 dark:border-nexora-border text-[10px] text-outline">
                  <button
                    onClick={() => handleStatusChange(t.id, 'todo')}
                    className="text-outline hover:text-on-surface"
                  >
                    Back to To-Do
                  </button>
                  <button
                    onClick={() => handleStatusChange(t.id, 'completed')}
                    className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    <span>Complete</span>
                    <CheckCircle2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="font-headline-md text-sm font-bold text-primary dark:text-white uppercase tracking-wider">
                Completed
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-nexora-card text-xs font-bold text-on-surface-variant dark:text-nexora-muted">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[300px] p-2 rounded-3xl bg-surface-container-low/60 dark:bg-nexora-card/40 border border-outline-variant/20 dark:border-nexora-border">
            {completedTasks.map(t => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-surface-container-lowest/80 dark:bg-nexora-surface/80 border border-outline-variant/20 dark:border-nexora-border shadow-xs space-y-2 opacity-85"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(t.priority)}`}>
                    {t.priority}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="text-outline hover:text-error transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-headline-md text-xs font-bold text-primary dark:text-white line-through">
                  {t.title}
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 dark:border-nexora-border text-[10px] text-outline">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Achieved
                  </span>
                  <button
                    onClick={() => handleStatusChange(t.id, 'in_progress')}
                    className="text-outline hover:underline"
                  >
                    Reopen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
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
              Create New Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary dark:text-white mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Transformers Attention Mechanisms"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary dark:text-white mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Details and deliverables..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-primary dark:text-white mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary dark:text-white mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white"
                  >
                    <option value="todo">To-Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary dark:text-white mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary dark:bg-nexora-violet font-semibold text-xs shadow hover:bg-primary transition-all"
              >
                Save Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
