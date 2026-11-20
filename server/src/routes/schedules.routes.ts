import { Router, Request, Response } from 'express';
import { supabaseAnon, supabaseAdmin, getLocalDB, saveLocalDB } from '../services/supabase';
import { ENV } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { generateSmartSchedule } from '../services/ai';
import { z } from 'zod';

const router = Router();

const scheduleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
  category: z.enum(['work', 'study', 'health', 'personal', 'focus']).default('work'),
});

// GET /api/schedules
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { date, startDate, endDate, category } = req.query;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    let query = supabaseAdmin.from('schedules').select('*').eq('user_id', userId);

    if (date && typeof date === 'string') {
      query = query.eq('date', date);
    } else if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }
    if (category && typeof category === 'string' && category !== 'all') {
      query = query.eq('category', category);
    }

    query = query.order('start_time', { ascending: true });

    const { data, error } = await query;
    if (!error && data) {
      res.status(200).json({ success: true, schedules: data });
      return;
    }
  }

  const db = getLocalDB();
  let schedules = db.schedules.filter(s => s.user_id === userId);

  if (date && typeof date === 'string') {
    schedules = schedules.filter(s => s.date === date);
  } else if (startDate && endDate) {
    schedules = schedules.filter(s => s.date >= (startDate as string) && s.date <= (endDate as string));
  }
  if (category && category !== 'all') {
    schedules = schedules.filter(s => s.category === category);
  }

  schedules.sort((a, b) => a.start_time.localeCompare(b.start_time));
  res.status(200).json({ success: true, schedules });
});

// POST /api/schedules
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const parse = scheduleSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.errors[0]?.message });
    return;
  }

  const { title, start_time, end_time, date, category } = parse.data;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('schedules')
      .insert({
        user_id: userId,
        title,
        start_time,
        end_time,
        date,
        category,
      })
      .select()
      .single();

    if (!error && data) {
      res.status(201).json({ success: true, schedule: data });
      return;
    }
  }

  const db = getLocalDB();
  const newSchedule = {
    id: 's-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    user_id: userId,
    title,
    start_time,
    end_time,
    date,
    category,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.schedules.push(newSchedule);
  saveLocalDB();

  res.status(201).json({ success: true, schedule: newSchedule });
});

// PUT /api/schedules/:id
router.put('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const scheduleId = req.params.id;
  const parse = scheduleSchema.partial().safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.errors[0]?.message });
    return;
  }

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('schedules')
      .update({ ...parse.data, updated_at: new Date().toISOString() })
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error && data) {
      res.status(200).json({ success: true, schedule: data });
      return;
    }
  }

  const db = getLocalDB();
  const schedule = db.schedules.find(s => s.id === scheduleId && s.user_id === userId);
  if (!schedule) {
    res.status(404).json({ success: false, error: 'Schedule item not found' });
    return;
  }

  Object.assign(schedule, parse.data, { updated_at: new Date().toISOString() });
  saveLocalDB();

  res.status(200).json({ success: true, schedule });
});

// DELETE /api/schedules/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const scheduleId = req.params.id;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId);

    if (!error) {
      res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
      return;
    }
  }

  const db = getLocalDB();
  const idx = db.schedules.findIndex(s => s.id === scheduleId && s.user_id === userId);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Schedule not found' });
    return;
  }

  db.schedules.splice(idx, 1);
  saveLocalDB();

  res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
});

// POST /api/schedules/suggest-ai (generate AI smart schedule)
router.post('/suggest-ai', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { preferences, targetDate = new Date().toISOString().split('T')[0] } = req.body;

  const db = getLocalDB();
  const userGoals = db.goals.filter(g => g.user_id === userId).map(g => g.goal_title);
  const pendingTasks = db.tasks.filter(t => t.user_id === userId && t.status !== 'completed').map(t => t.title);

  const contextItems = [...userGoals, ...pendingTasks];
  const suggestions = await generateSmartSchedule(contextItems, preferences);

  // Automatically insert into user schedules for the target date
  const createdItems = [];
  for (const item of suggestions) {
    const newSchedule = {
      id: 's-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      user_id: userId,
      title: item.title,
      start_time: item.start_time,
      end_time: item.end_time,
      date: targetDate,
      category: item.category as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.schedules.push(newSchedule);
    createdItems.push(newSchedule);
  }
  saveLocalDB();

  res.status(200).json({
    success: true,
    message: 'AI Schedule successfully generated and synchronized.',
    schedules: createdItems,
  });
});

export default router;
