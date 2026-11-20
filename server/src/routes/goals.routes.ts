import { Router, Request, Response } from 'express';
import { supabaseAnon, supabaseAdmin, getLocalDB, saveLocalDB } from '../services/supabase';
import { ENV } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const goalSchema = z.object({
  goal_title: z.string().min(1, 'Goal title is required'),
  description: z.string().optional().default(''),
  target_date: z.string().nullable().optional(),
  progress: z.number().min(0).max(100).default(0),
  status: z.enum(['active', 'achieved', 'paused']).default('active'),
});

// GET /api/goals
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      res.status(200).json({ success: true, goals: data });
      return;
    }
  }

  const db = getLocalDB();
  const goals = db.goals.filter(g => g.user_id === userId);
  res.status(200).json({ success: true, goals });
});

// POST /api/goals
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const parse = goalSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.errors[0]?.message });
    return;
  }

  const { goal_title, description, target_date, progress, status } = parse.data;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('goals')
      .insert({
        user_id: userId,
        goal_title,
        description,
        target_date: target_date || null,
        progress,
        status,
      })
      .select()
      .single();

    if (!error && data) {
      res.status(201).json({ success: true, goal: data });
      return;
    }
  }

  const db = getLocalDB();
  const newGoal = {
    id: 'g-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    user_id: userId,
    goal_title,
    description: description || '',
    target_date: target_date || null,
    progress,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.goals.unshift(newGoal);
  saveLocalDB();

  res.status(201).json({ success: true, goal: newGoal });
});

// PUT /api/goals/:id
router.put('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const goalId = req.params.id;
  const parse = goalSchema.partial().safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.errors[0]?.message });
    return;
  }

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('goals')
      .update({ ...parse.data, updated_at: new Date().toISOString() })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error && data) {
      res.status(200).json({ success: true, goal: data });
      return;
    }
  }

  const db = getLocalDB();
  const goal = db.goals.find(g => g.id === goalId && g.user_id === userId);
  if (!goal) {
    res.status(404).json({ success: false, error: 'Goal not found' });
    return;
  }

  Object.assign(goal, parse.data, { updated_at: new Date().toISOString() });
  if (goal.progress >= 100) goal.status = 'achieved';
  saveLocalDB();

  res.status(200).json({ success: true, goal });
});

// DELETE /api/goals/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const goalId = req.params.id;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (!error) {
      res.status(200).json({ success: true, message: 'Goal deleted successfully' });
      return;
    }
  }

  const db = getLocalDB();
  const index = db.goals.findIndex(g => g.id === goalId && g.user_id === userId);
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Goal not found' });
    return;
  }

  db.goals.splice(index, 1);
  saveLocalDB();

  res.status(200).json({ success: true, message: 'Goal deleted successfully' });
});

export default router;
