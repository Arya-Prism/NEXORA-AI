import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { ENV } from './config/env';
import { generalLimiter } from './middleware/rateLimiter';

// Import Route Handlers
import authRoutes from './routes/auth.routes';
import tasksRoutes from './routes/tasks.routes';
import goalsRoutes from './routes/goals.routes';
import schedulesRoutes from './routes/schedules.routes';
import focusRoutes from './routes/focus.routes';
import aiRoutes from './routes/ai.routes';
import learningRoutes from './routes/learning.routes';
import documentsRoutes from './routes/documents.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
app.use(cors({
  origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
}));

// JSON & Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiter
app.use('/api', generalLimiter);

// Serve static uploaded files safely
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// Healthcheck & System Status Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'NEXORA AI - Life & Productivity Intelligence Platform',
    timestamp: new Date().toISOString(),
    services: {
      supabase: ENV.isSupabaseConfigured() ? 'connected' : 'local_fallback',
      openai: ENV.isOpenAIConfigured() ? 'connected' : 'intelligent_fallback',
    }
  });
});

// Mount Feature APIs
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 NEXORA AI API Server running on http://localhost:${ENV.PORT}`);
    console.log(`⚙️  Mode: ${ENV.NODE_ENV}`);
    console.log(`🔒 Supabase Configured: ${ENV.isSupabaseConfigured()}`);
    console.log(`🧠 OpenAI Configured:   ${ENV.isOpenAIConfigured()}`);
    console.log(`=======================================================`);
  });
}

export default app;
