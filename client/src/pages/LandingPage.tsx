import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  PlayCircle,
  Star,
  CheckCircle2,
  Calendar,
  Brain,
  Timer,
  FileText,
  BarChart3,
  ChevronDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { openAuthModal } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does NEXORA AI combine nutrition, schedule, and productivity intelligence?',
      a: 'NEXORA treats human performance holistically. Rather than separating study and task management from metabolic energy, our AI engine synchronizes your high-cognition deep work blocks with optimal fueling, hydration rhythms, and habit streaks.'
    },
    {
      q: 'Does NEXORA AI work with my existing documents and study materials?',
      a: 'Yes. The Document Analyzer accepts PDF, TXT, MD, and image files. It automatically extracts key structural points, summarizes dense academic or operational texts, and allows you to chat directly with your documents.'
    },
    {
      q: 'Can I customize my focus intervals and Pomodoro timer?',
      a: 'Absolutely. Focus Mode provides standard 25-minute sprints, 50-minute deep work intervals, and fully custom durations that automatically log to your personal PostgreSQL database.'
    },
    {
      q: 'How is my private data secured?',
      a: 'All data is strictly partitioned using PostgreSQL Row Level Security (RLS) policies. Your tasks, schedules, chat logs, and documents are cryptographically isolated to your authenticated user account.'
    }
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Subtle Ambient Glows from Stitch Design */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-primary-fixed/25 via-secondary-container/10 to-transparent dark:from-nexora-violet/20 dark:via-nexora-cyan/10 blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-[600px] -right-48 w-96 h-96 bg-primary-fixed-dim/20 dark:bg-nexora-violet/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-[1200px] -left-48 w-96 h-96 bg-secondary-fixed/20 dark:bg-nexora-cyan/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* HERO SECTION */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 flex flex-col items-start gap-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary dark:bg-nexora-cyan animate-pulse"></span>
              <span className="text-xs font-semibold text-on-surface-variant dark:text-nexora-muted tracking-wide">
                ✨ Powered by Multimodal AI & PostgreSQL RLS
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-secondary dark:text-nexora-cyan uppercase tracking-widest">
                Life & Productivity Intelligence
              </span>
              <h1 className="font-display-lg text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary dark:text-white tracking-tight leading-tight">
                Think Smarter. <br />
                <span className="text-secondary dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-nexora-cyan dark:to-nexora-violet">
                  Execute Better.
                </span>
              </h1>
            </div>

            {/* Subhead */}
            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant dark:text-nexora-muted max-w-xl">
              Your 24/7 intelligent personal operating system. Organize tasks, calibrate daily schedules, master complex topics, decode nutrition photos, and sustain deep focus without burnout.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto pt-2">
              <button
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-container text-on-primary dark:bg-gradient-to-r dark:from-nexora-violet dark:to-nexora-violet-glow rounded-xl text-sm font-semibold shadow-lg shadow-primary-container/20 hover:bg-primary transition-all duration-200 active:scale-95"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-surface-container-lowest dark:bg-nexora-surface text-primary dark:text-white rounded-xl text-sm font-semibold border border-outline-variant/30 dark:border-nexora-border shadow-sm hover:bg-surface-container-low dark:hover:bg-nexora-card transition-all duration-200"
              >
                <PlayCircle className="w-4 h-4 text-secondary dark:text-nexora-cyan" />
                <span>Explore Live Platform</span>
              </Link>
            </div>

            {/* Trust Proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                <img
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-nexora-bg"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"
                  alt="User avatar"
                />
                <img
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-nexora-bg"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"
                  alt="User avatar"
                />
                <img
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-nexora-bg"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80"
                  alt="User avatar"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant dark:text-nexora-muted font-medium">
                  Trusted by 42,000+ researchers, students & builders
                </p>
              </div>
            </div>
          </div>

          {/* Right Hero Graphic: Glassmorphic Scanner Card from Stitch */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-[480px] rounded-3xl bg-surface-container-lowest/90 dark:bg-nexora-surface/90 backdrop-blur-xl border border-outline-variant/30 dark:border-nexora-border p-4 sm:p-6 shadow-2xl">
              {/* Scanner Header */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary dark:text-nexora-cyan" />
                  <span className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
                    NEXORA Neural Core v4.2
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/60 dark:bg-nexora-cyan/20 text-on-secondary-container dark:text-nexora-cyan text-[11px] font-semibold">
                  Live Neural Sync · 0.4s
                </span>
              </div>

              {/* Visual Card with AR Overlays */}
              <div className="relative w-full h-[280px] rounded-2xl overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                  alt="Mediterranean Quinoa Bowl Plate"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none"></div>

                {/* Live AI Bounding Box 1 */}
                <div className="absolute top-5 left-5 bg-white/95 dark:bg-nexora-surface/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2 border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-secondary dark:bg-nexora-cyan animate-ping"></span>
                  <span className="text-xs font-bold text-primary dark:text-white">Tri-Color Quinoa · 140g</span>
                </div>

                {/* Live AI Bounding Box 2 */}
                <div className="absolute top-20 right-5 bg-white/95 dark:bg-nexora-surface/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2 border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-primary dark:text-white">Organic Avocado · 45g</span>
                </div>

                {/* Health Score Float Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-nexora-surface/95 backdrop-blur-xl rounded-2xl p-3 shadow-lg flex items-center justify-between border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 dark:bg-nexora-cyan/10 flex items-center justify-center text-secondary dark:text-nexora-cyan font-bold text-sm">
                      94
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary dark:text-white">Optimal Bio-Fuel Match</p>
                      <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted">480 kcal · 32g Protein</p>
                    </div>
                  </div>
                  <Link
                    to="/analyzer"
                    className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary dark:bg-nexora-violet text-xs font-semibold shadow hover:bg-primary transition-all"
                  >
                    Analyze Plate
                  </Link>
                </div>
              </div>

              {/* Bottom Micro Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-2 border-t border-outline-variant/20 dark:border-nexora-border text-center">
                <div className="p-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg">
                  <span className="text-[10px] text-on-surface-variant dark:text-nexora-muted uppercase font-medium">Protein</span>
                  <p className="text-sm font-bold text-primary dark:text-white">32g / 130g</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg">
                  <span className="text-[10px] text-on-surface-variant dark:text-nexora-muted uppercase font-medium">Focus Sprints</span>
                  <p className="text-sm font-bold text-secondary dark:text-nexora-cyan">4 / 4 Done</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-container-low dark:bg-nexora-bg">
                  <span className="text-[10px] text-on-surface-variant dark:text-nexora-muted uppercase font-medium">Habit Streak</span>
                  <p className="text-sm font-bold text-amber-500">14 Days 🔥</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 border-t border-outline-variant/20 dark:border-nexora-border">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-secondary dark:text-nexora-cyan uppercase tracking-widest">
            Complete Life Operating System
          </span>
          <h2 className="font-headline-lg text-3xl sm:text-4xl font-bold text-primary dark:text-white mt-1">
            Engineered for Deep Focus & Peak Clarity
          </h2>
          <p className="text-sm text-on-surface-variant dark:text-nexora-muted mt-2">
            Every feature connects seamlessly through server-side AI, verified session security, and PostgreSQL persistence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: AI Chat Assistant */}
          <Link
            to="/assistant"
            className="group rounded-3xl bg-surface-container-lowest/80 dark:bg-nexora-surface/80 backdrop-blur-xl border border-outline-variant/30 dark:border-nexora-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary-container/10 dark:bg-nexora-violet/20 flex items-center justify-center text-primary dark:text-nexora-violet mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary dark:text-white">AI Assistant Engine</h3>
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-2 leading-relaxed">
                Multi-thread conversational assistant powered by OpenAI API. Generate customized daily schedules, explain complex theories, and synthesize actionable next steps.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-secondary dark:text-nexora-cyan mt-6">
              <span>Launch Chat</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Smart Planner */}
          <Link
            to="/planner"
            className="group rounded-3xl bg-surface-container-lowest/80 dark:bg-nexora-surface/80 backdrop-blur-xl border border-outline-variant/30 dark:border-nexora-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 dark:bg-nexora-cyan/20 flex items-center justify-center text-secondary dark:text-nexora-cyan mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary dark:text-white">Smart Weekly Planner</h3>
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-2 leading-relaxed">
                Adaptive daily and weekly calendar synced with meals, study, and deep work blocks. Filter by budget, preparation time, and protein requirements with one click.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-secondary dark:text-nexora-cyan mt-6">
              <span>Open Planner</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Task Management */}
          <Link
            to="/tasks"
            className="group rounded-3xl bg-surface-container-lowest/80 dark:bg-nexora-surface/80 backdrop-blur-xl border border-outline-variant/30 dark:border-nexora-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary dark:text-white">Task Management Board</h3>
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-2 leading-relaxed">
                Complete Kanban workflow for To-do, In Progress, and Completed tasks with deadline sorting, urgency prioritization, and database persistence.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-secondary dark:text-nexora-cyan mt-6">
              <span>Manage Tasks</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: AI Learning Hub */}
          <Link
            to="/learning"
            className="group rounded-3xl bg-surface-container-lowest/80 dark:bg-nexora-surface/80 backdrop-blur-xl border border-outline-variant/30 dark:border-nexora-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary dark:text-white">AI Learning Hub</h3>
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-2 leading-relaxed">
                Enter any complex topic to generate a personalized multi-week curriculum, progressive lesson checkpoints, and interactive quizzes with instant answer feedback.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-secondary dark:text-nexora-cyan mt-6">
              <span>Explore Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Document Analyzer */}
          <Link
            to="/analyzer"
            className="group rounded-3xl bg-surface-container-lowest/80 dark:bg-nexora-surface/80 backdrop-blur-xl border border-outline-variant/30 dark:border-nexora-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary dark:text-white">Document & Vision Analyzer</h3>
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-2 leading-relaxed">
                Upload PDFs, notes, or meal photos. Extract text, generate executive summaries, and query documents directly via contextual Q&A.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-secondary dark:text-nexora-cyan mt-6">
              <span>Upload Document</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Focus Timer & Pomodoro */}
          <Link
            to="/focus"
            className="group rounded-3xl bg-surface-container-lowest/80 dark:bg-nexora-surface/80 backdrop-blur-xl border border-outline-variant/30 dark:border-nexora-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <Timer className="w-6 h-6" />
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary dark:text-white">Focus Mode & Timer</h3>
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-2 leading-relaxed">
                Precision Pomodoro productivity timer. Track deep work sessions, link tasks, calculate daily focus streaks, and celebrate completed milestones.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-secondary dark:text-nexora-cyan mt-6">
              <span>Start Timer</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-secondary dark:text-nexora-cyan uppercase tracking-widest">FAQ</span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-sm text-primary dark:text-white hover:bg-surface-container-low dark:hover:bg-nexora-card transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-outline transition-transform duration-200 ${isOpen ? 'rotate-180 text-secondary dark:text-nexora-cyan' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs text-on-surface-variant dark:text-nexora-muted leading-relaxed border-t border-outline-variant/10 dark:border-nexora-border">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
