import { Router, Request, Response } from 'express';
import { supabaseAnon, supabaseAdmin, getLocalDB, saveLocalDB } from '../services/supabase';
import { ENV } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ----------------------------------------------------------
// POST /api/auth/register
// ----------------------------------------------------------
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0]?.message || 'Invalid registration data' });
      return;
    }

    const { email, password, full_name } = parse.data;

    // Cloud Supabase Auth if configured
    if (ENV.isSupabaseConfigured() && supabaseAnon) {
      const { data, error } = await supabaseAnon.auth.signUp({
        email,
        password,
        options: {
          data: { full_name }
        }
      });

      if (error) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email if required.',
        user: data.user,
        session: data.session,
      });
      return;
    }

    // Local DB Fallback
    const db = getLocalDB();
    const existing = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ success: false, error: 'User with this email already exists.' });
      return;
    }

    const newProfile = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      full_name,
      email,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}`,
      theme_preference: 'emerald',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.profiles.push(newProfile);
    saveLocalDB();

    res.status(201).json({
      success: true,
      message: 'Account created successfully (Local Dev Mode).',
      user: newProfile,
      token: 'demo-jwt-token-' + newProfile.id,
      isMock: true,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error during registration' });
  }
});

// ----------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: parse.error.errors[0]?.message || 'Invalid credentials' });
      return;
    }

    const { email, password } = parse.data;

    if (ENV.isSupabaseConfigured() && supabaseAnon) {
      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        res.status(401).json({ success: false, error: error.message });
        return;
      }

      res.status(200).json({
        success: true,
        user: data.user,
        session: data.session,
      });
      return;
    }

    // Local DB Fallback
    const db = getLocalDB();
    let profile = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (!profile) {
      // Auto-create or login demo user if matching demo email
      profile = {
        id: 'usr_' + Date.now().toString(36),
        full_name: email.split('@')[0],
        email,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        theme_preference: 'emerald',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.profiles.push(profile);
      saveLocalDB();
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully (Local Dev Mode).',
      user: profile,
      token: 'demo-jwt-token-' + profile.id,
      isMock: true,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error during login' });
  }
});

// ----------------------------------------------------------
// POST /api/auth/reset-password
// ----------------------------------------------------------
router.post('/reset-password', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: 'Email is required' });
    return;
  }

  if (ENV.isSupabaseConfigured() && supabaseAnon) {
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
      redirectTo: `${ENV.CLIENT_URL}/reset-password`,
    });
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
  }

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email address.',
  });
});

// ----------------------------------------------------------
// GET /api/auth/me
// ----------------------------------------------------------
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const db = getLocalDB();
  const profile = db.profiles.find(p => p.id === userId) || {
    id: userId,
    full_name: req.user!.full_name || 'Alex Rivera',
    email: req.user!.email,
    avatar_url: req.user!.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    theme_preference: 'emerald',
  };

  res.status(200).json({
    success: true,
    user: profile,
    configured: {
      supabase: ENV.isSupabaseConfigured(),
      openai: ENV.isOpenAIConfigured(),
    }
  });
});

// ----------------------------------------------------------
// PUT /api/auth/profile
// ----------------------------------------------------------
router.put('/profile', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { full_name, avatar_url, theme_preference } = req.body;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        avatar_url,
        theme_preference,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (!error && data) {
      res.status(200).json({ success: true, profile: data });
      return;
    }
  }

  const db = getLocalDB();
  let profile = db.profiles.find(p => p.id === userId);
  if (!profile) {
    profile = {
      id: userId,
      full_name: full_name || 'Alex Rivera',
      email: req.user!.email,
      avatar_url: avatar_url || '',
      theme_preference: theme_preference || 'emerald',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.profiles.push(profile);
  } else {
    if (full_name !== undefined) profile.full_name = full_name;
    if (avatar_url !== undefined) profile.avatar_url = avatar_url;
    if (theme_preference !== undefined) profile.theme_preference = theme_preference;
    profile.updated_at = new Date().toISOString();
  }

  saveLocalDB();
  res.status(200).json({ success: true, profile });
});

export default router;
