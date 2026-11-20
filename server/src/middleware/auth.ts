import { Request, Response, NextFunction } from 'express';
import { supabaseAnon, supabaseAdmin, getLocalDB } from '../services/supabase';
import { ENV } from '../config/env';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In local development or demo mode, if client provides an x-demo-user-id header, allow it
    const demoUserId = req.headers['x-user-id'] as string;
    if (demoUserId) {
      const db = getLocalDB();
      const profile = db.profiles.find(p => p.id === demoUserId);
      if (profile) {
        req.user = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        };
        return next();
      }
    }

    // Default to primary demo user in development fallback if Supabase is not configured
    if (!ENV.isSupabaseConfigured()) {
      const db = getLocalDB();
      const defaultUser = db.profiles[0];
      req.user = {
        id: defaultUser.id,
        email: defaultUser.email,
        full_name: defaultUser.full_name,
        avatar_url: defaultUser.avatar_url,
      };
      return next();
    }

    res.status(401).json({
      success: false,
      error: 'Authentication required. Missing Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  // If Supabase is configured, verify token with Supabase Auth
  if (ENV.isSupabaseConfigured() && (supabaseAnon || supabaseAdmin)) {
    try {
      const client = supabaseAdmin || supabaseAnon!;
      const { data: { user }, error } = await client.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({
          success: false,
          error: error?.message || 'Invalid or expired session token.',
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      };

      return next();
    } catch (err: any) {
      res.status(401).json({
        success: false,
        error: 'Failed to authenticate user token: ' + (err.message || 'Unknown error'),
      });
      return;
    }
  }

  // Fallback dev token verification
  const db = getLocalDB();
  const profile = db.profiles[0];
  req.user = {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  };
  next();
}
