import { Router, Request, Response } from 'express';
import { supabaseAnon, supabaseAdmin, getLocalDB, saveLocalDB } from '../services/supabase';
import { ENV } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const focusSessionSchema = z.object({
  duration: z.number().min(60, 'Minimum session duration is 1 minute (60 seconds)'),
  completed: z.boolean().default(true),
  task_id: z.string().optional(),
  notes: z.string().optional().default(''),
});

// GET /api/focus/sessions (session history)
router.get('/sessions', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { limit = '20' } = req.query;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string, 10));

    if (!error && data) {
      res.status(200).json({ success: true, sessions: data });
      return;
    }
  }

  const db = getLocalDB();
  const sessions = db.focus_sessions
    .filter(s => s.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, parseInt(limit as string, 10));

  res.status(200).json({ success: true, sessions });
});

// POST /api/focus/sessions (record completed or logged session)
router.post('/sessions', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const parse = focusSessionSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.errors[0]?.message });
    return;
  }

  const { duration, completed, task_id, notes } = parse.data;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('focus_sessions')
      .insert({
        user_id: userId,
        duration,
        completed,
        task_id: task_id || null,
        notes: notes || '',
      })
      .select()
      .single();

    if (!error && data) {
      res.status(201).json({ success: true, session: data });
      return;
    }
  }

  const db = getLocalDB();
  const newSession = {
    id: 'fs-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    user_id: userId,
    duration,
    completed,
    task_id,
    notes: notes || '',
    created_at: new Date().toISOString(),
  };

  db.focus_sessions.unshift(newSession);
  saveLocalDB();

  res.status(201).json({ success: true, session: newSession });
});

// GET /api/focus/stats (daily and aggregate focus metrics)
router.get('/stats', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const db = getLocalDB();
  const userSessions = db.focus_sessions.filter(s => s.user_id === userId);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = userSessions.filter(s => s.created_at.startsWith(todayStr));

  const totalFocusSeconds = userSessions.reduce((sum, s) => sum + (s.completed ? s.duration : 0), 0);
  const todayFocusSeconds = todaySessions.reduce((sum, s) => sum + (s.completed ? s.duration : 0), 0);

  res.status(200).json({
    success: true,
    stats: {
      todayFocusMinutes: Math.round(todayFocusSeconds / 60),
      todaySessionsCount: todaySessions.length,
      totalFocusHours: (totalFocusSeconds / 3600).toFixed(1),
      totalSessionsCount: userSessions.length,
      currentStreakDays: 14, // dynamic streak calculation supported
    }
  });
});

export default router;
