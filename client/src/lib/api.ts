import {
  UserProfile,
  Task,
  Goal,
  ScheduleItem,
  FocusSession,
  Conversation,
  ChatMessage,
  DocumentItem,
  LearningItem,
  AnalyticsSummary,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('nexora_token');
  const user = localStorage.getItem('nexora_user');
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.id) headers['x-user-id'] = parsed.id;
    } catch {}
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body: { email: string; password: string; full_name: string }) =>
    request<{ success: boolean; user: UserProfile; token?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ success: boolean; user: UserProfile; token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  resetPassword: (email: string) =>
    request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getMe: () =>
    request<{ success: boolean; user: UserProfile; configured: { supabase: boolean; openai: boolean } }>('/auth/me'),

  updateProfile: (body: Partial<UserProfile>) =>
    request<{ success: boolean; profile: UserProfile }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // Tasks
  getTasks: (params?: { status?: string; priority?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; tasks: Task[] }>(`/tasks${q ? `?${q}` : ''}`);
  },

  createTask: (task: Partial<Task>) =>
    request<{ success: boolean; task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  updateTask: (id: string, task: Partial<Task>) =>
    request<{ success: boolean; task: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    }),

  updateTaskStatus: (id: string, status: Task['status']) =>
    request<{ success: boolean; task: Task }>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteTask: (id: string) =>
    request<{ success: boolean; message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Goals
  getGoals: () => request<{ success: boolean; goals: Goal[] }>('/goals'),

  createGoal: (goal: Partial<Goal>) =>
    request<{ success: boolean; goal: Goal }>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    }),

  updateGoal: (id: string, goal: Partial<Goal>) =>
    request<{ success: boolean; goal: Goal }>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    }),

  deleteGoal: (id: string) =>
    request<{ success: boolean; message: string }>(`/goals/${id}`, {
      method: 'DELETE',
    }),

  // Schedules
  getSchedules: (params?: { date?: string; category?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; schedules: ScheduleItem[] }>(`/schedules${q ? `?${q}` : ''}`);
  },

  createSchedule: (schedule: Partial<ScheduleItem>) =>
    request<{ success: boolean; schedule: ScheduleItem }>('/schedules', {
      method: 'POST',
      body: JSON.stringify(schedule),
    }),

  deleteSchedule: (id: string) =>
    request<{ success: boolean; message: string }>(`/schedules/${id}`, {
      method: 'DELETE',
    }),

  suggestAiSchedule: (body: { preferences?: string; targetDate?: string }) =>
    request<{ success: boolean; message: string; schedules: ScheduleItem[] }>('/schedules/suggest-ai', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Focus
  getFocusSessions: (limit = 20) =>
    request<{ success: boolean; sessions: FocusSession[] }>(`/focus/sessions?limit=${limit}`),

  recordFocusSession: (session: { duration: number; completed: boolean; notes?: string; task_id?: string }) =>
    request<{ success: boolean; session: FocusSession }>('/focus/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    }),

  getFocusStats: () =>
    request<{
      success: boolean;
      stats: {
        todayFocusMinutes: number;
        todaySessionsCount: number;
        totalFocusHours: string;
        totalSessionsCount: number;
        currentStreakDays: number;
      };
    }>('/focus/stats'),

  // AI Assistant
  getConversations: () =>
    request<{ success: boolean; conversations: Conversation[] }>('/ai/conversations'),

  createConversation: (title?: string) =>
    request<{ success: boolean; conversation: Conversation }>('/ai/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  deleteConversation: (id: string) =>
    request<{ success: boolean; message: string }>(`/ai/conversations/${id}`, {
      method: 'DELETE',
    }),

  getMessages: (conversationId: string) =>
    request<{ success: boolean; messages: ChatMessage[] }>(`/ai/conversations/${conversationId}/messages`),

  sendMessage: (body: { conversationId?: string; content: string; systemPrompt?: string }) =>
    request<{ success: boolean; message: ChatMessage; conversationId: string; isSimulated: boolean }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Learning Hub
  getLearningItems: () =>
    request<{ success: boolean; learning: LearningItem[] }>('/learning'),

  generateRoadmap: (topic: string, difficulty = 'intermediate') =>
    request<{ success: boolean; learning: LearningItem; curriculum: any }>('/learning/roadmap', {
      method: 'POST',
      body: JSON.stringify({ topic, difficulty }),
    }),

  toggleLesson: (learningId: string, lessonId: number, completed: boolean) =>
    request<{ success: boolean; learning: LearningItem }>(`/learning/${learningId}/lesson`, {
      method: 'PATCH',
      body: JSON.stringify({ lessonId, completed }),
    }),

  // Documents
  getDocuments: () =>
    request<{ success: boolean; documents: DocumentItem[] }>('/documents'),

  uploadDocument: async (file: File): Promise<{ success: boolean; document: DocumentItem }> => {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    const token = localStorage.getItem('nexora_token');
    const user = localStorage.getItem('nexora_user');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.id) headers['x-user-id'] = parsed.id;
      } catch {}
    }

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  askDocumentQuestion: (documentId: string, question: string) =>
    request<{ success: boolean; question: string; answer: string; documentTitle: string }>(
      `/documents/${documentId}/qa`,
      {
        method: 'POST',
        body: JSON.stringify({ question }),
      }
    ),

  deleteDocument: (id: string) =>
    request<{ success: boolean; message: string }>(`/documents/${id}`, {
      method: 'DELETE',
    }),

  // Analytics
  getAnalyticsDashboard: () =>
    request<{ success: boolean; analytics: AnalyticsSummary }>('/analytics/dashboard'),
};
