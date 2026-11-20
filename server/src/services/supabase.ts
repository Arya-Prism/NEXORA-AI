import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';
import fs from 'fs';
import path from 'path';

// Official Supabase Client
let supabaseAdmin: SupabaseClient | null = null;
let supabaseAnon: SupabaseClient | null = null;

if (ENV.isSupabaseConfigured()) {
  try {
    supabaseAnon = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
    if (ENV.SUPABASE_SERVICE_ROLE_KEY) {
      supabaseAdmin = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY);
    }
    console.log('[Supabase] Successfully initialized Supabase client.');
  } catch (err) {
    console.warn('[Supabase] Failed to initialize Supabase client:', err);
  }
} else {
  console.log('[Supabase] Credentials not set. Operating in Local Secure Store fallback mode.');
}

export { supabaseAdmin, supabaseAnon };

// Local Dev Data Store (when Supabase credentials are not yet provided)
// Automatically persists to local JSON file so that restarts keep state.
const DATA_FILE = path.resolve(__dirname, '../../data/local_db.json');

export interface LocalDatabase {
  profiles: Array<{
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    theme_preference: string;
    created_at: string;
    updated_at: string;
  }>;
  tasks: Array<{
    id: string;
    user_id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in_progress' | 'completed';
    due_date: string | null;
    created_at: string;
    updated_at: string;
  }>;
  goals: Array<{
    id: string;
    user_id: string;
    goal_title: string;
    description: string;
    target_date: string | null;
    progress: number;
    status: 'active' | 'achieved' | 'paused';
    created_at: string;
    updated_at: string;
  }>;
  schedules: Array<{
    id: string;
    user_id: string;
    title: string;
    start_time: string;
    end_time: string;
    date: string;
    category: 'work' | 'study' | 'health' | 'personal' | 'focus';
    created_at: string;
    updated_at: string;
  }>;
  focus_sessions: Array<{
    id: string;
    user_id: string;
    duration: number;
    completed: boolean;
    task_id?: string;
    notes: string;
    created_at: string;
  }>;
  conversations: Array<{
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
  }>;
  messages: Array<{
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
  }>;
  documents: Array<{
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    summary: string;
    key_points: string[];
    created_at: string;
  }>;
  learning_progress: Array<{
    id: string;
    user_id: string;
    topic: string;
    difficulty: string;
    progress: number;
    completed_lessons: Array<{ id: number; title: string; completed: boolean }>;
    roadmap: Array<{ week: number; title: string; description: string }>;
    created_at: string;
    updated_at: string;
  }>;
}

const defaultUser = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Alex Rivera',
  email: 'alex.rivera@nexora.ai',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  theme_preference: 'emerald',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function initDefaultDB(): LocalDatabase {
  return {
    profiles: [defaultUser],
    tasks: [
      {
        id: 't-1',
        user_id: defaultUser.id,
        title: 'Complete System Architecture Review',
        description: 'Verify PostgreSQL schema, constraints, and RLS policies',
        priority: 'urgent',
        status: 'in_progress',
        due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 't-2',
        user_id: defaultUser.id,
        title: 'Review Multimodal AI Vision Documentation',
        description: 'Study GPT-4o vision prompts and response schemas',
        priority: 'high',
        status: 'todo',
        due_date: new Date(Date.now() + 86400000 * 4).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 't-3',
        user_id: defaultUser.id,
        title: 'Daily Hydration & Macro Intake Check',
        description: 'Drink 2.8L water and hit 130g protein threshold',
        priority: 'medium',
        status: 'completed',
        due_date: new Date().toISOString(),
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 't-4',
        user_id: defaultUser.id,
        title: 'Prepare Weekly Research Lab Summary',
        description: 'Summarize model inference benchmarks and latency tests',
        priority: 'low',
        status: 'todo',
        due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    goals: [
      {
        id: 'g-1',
        user_id: defaultUser.id,
        goal_title: 'Master Modern Cloud & AI Engineering',
        description: 'Build 10 production-ready AI services with rigorous typing and RLS',
        target_date: new Date(Date.now() + 86400000 * 45).toISOString(),
        progress: 75,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'g-2',
        user_id: defaultUser.id,
        goal_title: 'Maintain 21-Day Deep Focus Streak',
        description: 'Complete at least 4 daily Pomodoro focus blocks',
        target_date: new Date(Date.now() + 86400000 * 14).toISOString(),
        progress: 66,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'g-3',
        user_id: defaultUser.id,
        goal_title: 'Optimal Bio-Rhythm & Energy Balance',
        description: 'Maintain 90%+ nutrition consistency and daily hydration',
        target_date: new Date(Date.now() + 86400000 * 30).toISOString(),
        progress: 88,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    schedules: [
      {
        id: 's-1',
        user_id: defaultUser.id,
        title: 'Deep Focus: Backend REST API Architecture',
        start_time: '09:00',
        end_time: '11:00',
        date: new Date().toISOString().split('T')[0],
        category: 'work',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 's-2',
        user_id: defaultUser.id,
        title: 'Nutrient Fueling: High Protein Mediterranean Lunch',
        start_time: '12:30',
        end_time: '13:30',
        date: new Date().toISOString().split('T')[0],
        category: 'health',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 's-3',
        user_id: defaultUser.id,
        title: 'AI Learning Hub: Transformers & Deep Learning',
        start_time: '15:00',
        end_time: '16:30',
        date: new Date().toISOString().split('T')[0],
        category: 'study',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 's-4',
        user_id: defaultUser.id,
        title: 'Evening Physical Conditioning & Hydration',
        start_time: '18:00',
        end_time: '19:00',
        date: new Date().toISOString().split('T')[0],
        category: 'health',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    focus_sessions: [
      {
        id: 'fs-1',
        user_id: defaultUser.id,
        duration: 1500,
        completed: true,
        notes: 'API routes and validation middleware',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'fs-2',
        user_id: defaultUser.id,
        duration: 1500,
        completed: true,
        notes: 'Database schema modeling and RLS policies',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'fs-3',
        user_id: defaultUser.id,
        duration: 1200,
        completed: true,
        notes: 'OpenAI assistant engine prompt engineering',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      }
    ],
    conversations: [
      {
        id: 'c-1',
        user_id: defaultUser.id,
        title: 'Weekly Productivity & Study Optimization',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    messages: [
      {
        id: 'm-1',
        conversation_id: 'c-1',
        role: 'assistant',
        content: "Hello Alex! I am your NEXORA AI Personal Intelligence companion. How can I optimize your schedule, clarify complex topics, or accelerate your goals today?",
        created_at: new Date().toISOString(),
      }
    ],
    documents: [
      {
        id: 'doc-1',
        user_id: defaultUser.id,
        file_name: 'Nexora_Platform_Overview.pdf',
        file_path: '/uploads/Nexora_Platform_Overview.pdf',
        file_size: 245000,
        file_type: 'application/pdf',
        summary: 'Executive overview of NEXORA AI intelligence architecture, covering multi-tenant security, neural assistant capabilities, and metabolic tracking engines.',
        key_points: [
          'Unified multi-tier productivity and metabolic intelligence system',
          'PostgreSQL Row Level Security prevents multi-tenant data leakage',
          'Real-time streaming conversational assistant with contextual memory'
        ],
        created_at: new Date().toISOString(),
      }
    ],
    learning_progress: [
      {
        id: 'lp-1',
        user_id: defaultUser.id,
        topic: 'Neural Attention & Transformers',
        difficulty: 'intermediate',
        progress: 75,
        completed_lessons: [
          { id: 1, title: 'Self-Attention Mathematical Mechanics', completed: true },
          { id: 2, title: 'Multi-Head Attention Matrices', completed: true },
          { id: 3, title: 'Positional Encodings & RoPE', completed: true },
          { id: 4, title: 'Flash Attention & Memory IO Bounds', completed: false }
        ],
        roadmap: [
          { week: 1, title: 'Vector Embeddings & Dot-Product Attention', description: 'Core linear algebra behind transformer models' },
          { week: 2, title: 'Encoder-Decoder Architecture', description: 'Cross-attention and transformer blocks' },
          { week: 3, title: 'Inference Optimizations', description: 'KV caching, quantization, and speculative decoding' }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  };
}

let memoryDB: LocalDatabase | null = null;

export function getLocalDB(): LocalDatabase {
  if (memoryDB) return memoryDB;

  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryDB = JSON.parse(raw);
      return memoryDB!;
    }
  } catch (err) {
    console.warn('[LocalDB] Error reading local data file, initializing fresh store:', err);
  }

  memoryDB = initDefaultDB();
  saveLocalDB();
  return memoryDB;
}

export function saveLocalDB(): void {
  if (!memoryDB) return;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryDB, null, 2), 'utf-8');
  } catch (err) {
    console.error('[LocalDB] Error persisting local database:', err);
  }
}
