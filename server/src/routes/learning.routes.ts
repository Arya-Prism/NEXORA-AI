import { Router, Request, Response } from 'express';
import { supabaseAnon, supabaseAdmin, getLocalDB, saveLocalDB } from '../services/supabase';
import { ENV } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { generateLearningRoadmap } from '../services/ai';
import { z } from 'zod';

const router = Router();

// GET /api/learning (get all learning progress items for user)
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      res.status(200).json({ success: true, learning: data });
      return;
    }
  }

  const db = getLocalDB();
  const list = db.learning_progress.filter(l => l.user_id === userId);
  res.status(200).json({ success: true, learning: list });
});

// POST /api/learning/roadmap (generate new roadmap & curriculum)
router.post('/roadmap', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { topic, difficulty = 'intermediate' } = req.body;

  if (!topic || typeof topic !== 'string') {
    res.status(400).json({ success: false, error: 'Topic is required' });
    return;
  }

  const curriculum = await generateLearningRoadmap(topic, difficulty);

  const db = getLocalDB();
  let existing = db.learning_progress.find(
    l => l.user_id === userId && l.topic.toLowerCase() === topic.toLowerCase()
  );

  if (existing) {
    existing.difficulty = difficulty;
    existing.roadmap = curriculum.roadmap || existing.roadmap;
    existing.updated_at = new Date().toISOString();
  } else {
    existing = {
      id: 'lp-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
      user_id: userId,
      topic,
      difficulty,
      progress: 25,
      completed_lessons: curriculum.lessons || [
        { id: 1, title: `Introduction to ${topic}`, completed: true },
        { id: 2, title: `Core Architectures of ${topic}`, completed: false },
      ],
      roadmap: curriculum.roadmap || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.learning_progress.unshift(existing);
  }

  saveLocalDB();

  res.status(200).json({
    success: true,
    learning: existing,
    curriculum,
  });
});

// PATCH /api/learning/:id/lesson (toggle lesson completion)
router.patch('/:id/lesson', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const learningId = req.params.id;
  const { lessonId, completed } = req.body;

  const db = getLocalDB();
  const item = db.learning_progress.find(l => l.id === learningId && l.user_id === userId);

  if (!item) {
    res.status(404).json({ success: false, error: 'Learning topic not found' });
    return;
  }

  const lesson = item.completed_lessons.find(l => l.id === lessonId);
  if (lesson) {
    lesson.completed = Boolean(completed);
  } else {
    item.completed_lessons.push({ id: lessonId, title: `Lesson ${lessonId}`, completed: Boolean(completed) });
  }

  // Recalculate progress
  const doneCount = item.completed_lessons.filter(l => l.completed).length;
  item.progress = Math.round((doneCount / Math.max(item.completed_lessons.length, 1)) * 100);
  item.updated_at = new Date().toISOString();

  saveLocalDB();

  res.status(200).json({ success: true, learning: item });
});

export default router;
