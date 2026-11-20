import { Router, Request, Response } from 'express';
import { supabaseAnon, supabaseAdmin, getLocalDB, saveLocalDB } from '../services/supabase';
import { ENV } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'completed']).default('todo'),
  due_date: z.string().nullable().optional(),
});

// ----------------------------------------------------------
// GET /api/tasks (list with search, filter, and sorting)
// ----------------------------------------------------------
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { status, priority, search, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

  // Real Supabase if configured
  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    let query = supabaseAdmin.from('tasks').select('*').eq('user_id', userId);

    if (status && typeof status === 'string' && status !== 'all') {
      query = query.eq('status', status);
    }
    if (priority && typeof priority === 'string' && priority !== 'all') {
      query = query.eq('priority', priority);
    }
    if (search && typeof search === 'string') {
      query = query.ilike('title', `%${search}%`);
    }

    query = query.order(sortBy as string, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;
    if (!error && data) {
      res.status(200).json({ success: true, tasks: data });
      return;
    }
  }

  // Local DB Fallback
  const db = getLocalDB();
  let tasks = db.tasks.filter(t => t.user_id === userId);

  if (status && status !== 'all') {
    tasks = tasks.filter(t => t.status === status);
  }
  if (priority && priority !== 'all') {
    tasks = tasks.filter(t => t.priority === priority);
  }
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }

  tasks.sort((a: any, b: any) => {
    const valA = a[sortBy as string] || '';
    const valB = b[sortBy as string] || '';
    return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  res.status(200).json({ success: true, tasks });
});

// ----------------------------------------------------------
// POST /api/tasks (create task)
// ----------------------------------------------------------
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const parse = taskSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.errors[0]?.message || 'Invalid task data' });
    return;
  }

  const { title, description, priority, status, due_date } = parse.data;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: userId,
        title,
        description,
        priority,
        status,
        due_date: due_date || null,
      })
      .select()
      .single();

    if (!error && data) {
      res.status(201).json({ success: true, task: data });
      return;
    }
  }

  // Local DB Fallback
  const db = getLocalDB();
  const newTask = {
    id: 't-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    user_id: userId,
    title,
    description: description || '',
    priority,
    status,
    due_date: due_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.tasks.unshift(newTask);
  saveLocalDB();

  res.status(201).json({ success: true, task: newTask });
});

// ----------------------------------------------------------
// PUT /api/tasks/:id (update full task)
// ----------------------------------------------------------
router.put('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const taskId = req.params.id;
  const parse = taskSchema.partial().safeParse(req.body);

  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.errors[0]?.message });
    return;
  }

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({
        ...parse.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error && data) {
      res.status(200).json({ success: true, task: data });
      return;
    }
  }

  const db = getLocalDB();
  const task = db.tasks.find(t => t.id === taskId && t.user_id === userId);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  Object.assign(task, parse.data, { updated_at: new Date().toISOString() });
  saveLocalDB();

  res.status(200).json({ success: true, task });
});

// ----------------------------------------------------------
// PATCH /api/tasks/:id/status (toggle status)
// ----------------------------------------------------------
router.patch('/:id/status', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const taskId = req.params.id;
  const { status } = req.body;

  if (!['todo', 'in_progress', 'completed'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status' });
    return;
  }

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error && data) {
      res.status(200).json({ success: true, task: data });
      return;
    }
  }

  const db = getLocalDB();
  const task = db.tasks.find(t => t.id === taskId && t.user_id === userId);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  task.status = status;
  task.updated_at = new Date().toISOString();
  saveLocalDB();

  res.status(200).json({ success: true, task });
});

// ----------------------------------------------------------
// DELETE /api/tasks/:id
// ----------------------------------------------------------
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const taskId = req.params.id;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (!error) {
      res.status(200).json({ success: true, message: 'Task deleted successfully' });
      return;
    }
  }

  const db = getLocalDB();
  const index = db.tasks.findIndex(t => t.id === taskId && t.user_id === userId);
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  db.tasks.splice(index, 1);
  saveLocalDB();

  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

export default router;
