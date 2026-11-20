import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { LearningItem } from '../types';
import {
  Brain,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Search,
  Check,
  X,
  Zap,
} from 'lucide-react';

export const LearningHubPage: React.FC = () => {
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<LearningItem | null>(null);
  const [topicInput, setTopicInput] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    loadLearningItems();
  }, []);

  const loadLearningItems = async () => {
    try {
      const res = await api.getLearningItems();
      setLearningItems(res.learning);
      if (res.learning.length > 0 && !selectedTopic) {
        setSelectedTopic(res.learning[0]);
      }
    } catch (err) {
      console.warn('Failed to load learning items:', err);
    }
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    try {
      const res = await api.generateRoadmap(topicInput, difficulty);
      setLearningItems(prev => [res.learning, ...prev.filter(l => l.id !== res.learning.id)]);
      setSelectedTopic(res.learning);
      if (res.curriculum?.quiz) {
        setQuizData(res.curriculum.quiz);
      }
      setTopicInput('');
    } catch (err: any) {
      alert('Error generating roadmap: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleLesson = async (lessonId: number, currentCompleted: boolean) => {
    if (!selectedTopic) return;
    try {
      const res = await api.toggleLesson(selectedTopic.id, lessonId, !currentCompleted);
      setSelectedTopic(res.learning);
      setLearningItems(prev =>
        prev.map(l => (l.id === res.learning.id ? res.learning : l))
      );
    } catch (err: any) {
      alert('Error toggling lesson: ' + err.message);
    }
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-low dark:bg-nexora-surface p-6 md:p-8 border border-outline-variant/30 dark:border-nexora-border shadow-sm mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/90 dark:bg-nexora-bg text-secondary dark:text-nexora-cyan text-xs font-semibold shadow-xs mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>AI Curriculum & Interactive Concept Synthesis</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary dark:text-white tracking-tight">
            AI Learning Hub & Skill Accelerator
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant dark:text-nexora-muted mt-1">
            Enter any technical, scientific, or biological topic to construct customized multi-week roadmaps and verify retention with progressive quizzes.
          </p>
        </div>

        {/* Input Topic Box */}
        <form onSubmit={handleGenerateRoadmap} className="mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-outline" />
            <input
              type="text"
              required
              placeholder="e.g. Distributed Database Consensus, Transformer Attention, Biometrics"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container-lowest dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as any)}
              className="px-3 py-2.5 rounded-2xl bg-surface-container-lowest dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <button
              type="submit"
              disabled={isGenerating}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-container text-on-primary dark:bg-nexora-violet text-xs font-semibold shadow-md hover:bg-primary transition-all disabled:opacity-50 shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Build Roadmap'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Topics List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-headline-md text-sm font-bold text-primary dark:text-white uppercase tracking-wider">
            Your Learning Topics
          </h2>

          <div className="space-y-3">
            {learningItems.map(item => {
              const isSelected = selectedTopic?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedTopic(item);
                    setQuizSubmitted(false);
                    setSelectedAnswers({});
                  }}
                  className={`p-4 rounded-3xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-surface-container-lowest dark:bg-nexora-surface border-secondary dark:border-nexora-cyan shadow-md'
                      : 'bg-surface-container-low dark:bg-nexora-card border-outline-variant/20 dark:border-nexora-border hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-headline-md text-xs font-bold text-primary dark:text-white">{item.topic}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-nexora-bg text-secondary dark:text-nexora-cyan">
                      {item.difficulty}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant dark:text-nexora-muted mb-1">
                      <span>Curriculum Progress</span>
                      <span className="font-bold text-primary dark:text-white">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-surface-container dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-secondary dark:bg-nexora-cyan h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Curriculum Roadmap & Quiz (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTopic ? (
            <>
              {/* Active Topic Banner */}
              <div className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/20 dark:border-nexora-border">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary dark:text-nexora-cyan">
                      Active Curriculum
                    </span>
                    <h2 className="font-headline-lg text-xl font-bold text-primary dark:text-white mt-0.5">
                      {selectedTopic.topic}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary dark:text-white">
                      Overall Mastery: {selectedTopic.progress}%
                    </span>
                  </div>
                </div>

                {/* Lesson Checkpoints */}
                <div className="mt-5 space-y-2.5">
                  <h3 className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
                    Progressive Lessons & Units
                  </h3>
                  {selectedTopic.completed_lessons?.map(lesson => (
                    <div
                      key={lesson.id}
                      onClick={() => handleToggleLesson(lesson.id, lesson.completed)}
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                        lesson.completed
                          ? 'bg-secondary-container/20 border-secondary/30 text-primary dark:text-white'
                          : 'bg-surface-container-low dark:bg-nexora-card border-outline-variant/20 dark:border-nexora-border text-on-surface-variant dark:text-nexora-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            lesson.completed
                              ? 'bg-secondary dark:bg-nexora-cyan border-transparent text-white dark:text-nexora-bg'
                              : 'border-outline'
                          }`}
                        >
                          {lesson.completed && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-xs font-semibold ${lesson.completed ? 'line-through text-outline' : ''}`}>
                          {lesson.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium opacity-60">
                        {lesson.completed ? 'Completed' : 'Tap to mark done'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Week Roadmap Visualization */}
              <div className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
                <h3 className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-4">
                  Multi-Week Strategic Roadmap
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTopic.roadmap?.map((week, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-surface-container-low dark:bg-nexora-card border border-outline-variant/20 dark:border-nexora-border"
                    >
                      <span className="text-[10px] font-bold uppercase text-secondary dark:text-nexora-cyan">
                        Week {week.week || idx + 1}
                      </span>
                      <h4 className="font-headline-md text-xs font-bold text-primary dark:text-white mt-1">
                        {week.title}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted mt-1 leading-relaxed">
                        {week.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Quiz Checkpoint */}
              {quizData.length > 0 && (
                <div className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-4 h-4 text-secondary dark:text-nexora-cyan" />
                    <h3 className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
                      Interactive Knowledge Check
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {quizData.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-2.5">
                        <p className="text-xs font-bold text-primary dark:text-white">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options?.map((opt: string, optIdx: number) => {
                            const isSelected = selectedAnswers[qIdx] === optIdx;
                            const isCorrect = optIdx === q.answer;
                            let btnStyle = 'bg-surface-container-low dark:bg-nexora-card border-outline-variant/20';

                            if (quizSubmitted) {
                              if (isCorrect) {
                                btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                              } else if (isSelected) {
                                btnStyle = 'bg-rose-100 border-rose-500 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
                              }
                            } else if (isSelected) {
                              btnStyle = 'bg-primary-container text-on-primary dark:bg-nexora-violet dark:text-white';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectAnswer(qIdx, optIdx)}
                                className={`w-full text-left p-3 rounded-2xl border text-xs font-medium transition-colors ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && q.explanation && (
                          <div className="p-3 rounded-xl bg-surface-container-high dark:bg-nexora-bg text-[11px] text-on-surface-variant dark:text-nexora-muted border border-outline-variant/20">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary dark:bg-nexora-violet text-xs font-semibold shadow hover:bg-primary transition-all"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setSelectedAnswers({});
                        }}
                        className="px-4 py-2 rounded-xl bg-surface-container-low dark:bg-nexora-card text-xs font-semibold"
                      >
                        Retake Quiz
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border p-8">
              <Brain className="w-12 h-12 text-outline mx-auto mb-3" />
              <p className="text-sm font-semibold text-primary dark:text-white">
                No learning topic selected.
              </p>
              <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-1">
                Enter any subject above to generate an instant curriculum roadmap.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
