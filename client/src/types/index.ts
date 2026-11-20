export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  theme_preference?: 'emerald' | 'midnight' | 'system';
  created_at?: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  goal_title: string;
  description: string;
  target_date: string | null;
  progress: number;
  status: 'active' | 'achieved' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface ScheduleItem {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  date: string;
  category: 'work' | 'study' | 'health' | 'personal' | 'focus';
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  duration: number; // in seconds
  completed: boolean;
  task_id?: string;
  notes?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  summary: string;
  key_points: string[];
  created_at: string;
}

export interface LearningItem {
  id: string;
  user_id: string;
  topic: string;
  difficulty: string;
  progress: number;
  completed_lessons: Array<{ id: number; title: string; completed: boolean }>;
  roadmap: Array<{ week: number; title: string; description: string }>;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    completionRate: number;
  };
  goals: {
    total: number;
    active: number;
    averageProgress: number;
  };
  focus: {
    totalMinutes: number;
    totalHours: string;
    sessionsCount: number;
    weeklyDistribution: Array<{ day: string; date: string; minutes: number }>;
  };
  learning: {
    topicsCount: number;
    completedLessonsCount: number;
    averageProgress: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    time: string;
  }>;
}
