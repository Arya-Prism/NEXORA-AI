import { Router, Request, Response } from 'express';
import { supabaseAnon, supabaseAdmin, getLocalDB, saveLocalDB } from '../services/supabase';
import { ENV } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import { generateChatResponse } from '../services/ai';
import { z } from 'zod';

const router = Router();

// GET /api/ai/conversations
router.get('/conversations', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      res.status(200).json({ success: true, conversations: data });
      return;
    }
  }

  const db = getLocalDB();
  const convs = db.conversations
    .filter(c => c.user_id === userId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  res.status(200).json({ success: true, conversations: convs });
});

// POST /api/ai/conversations (create new conversation thread)
router.post('/conversations', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { title = 'New Conversation' } = req.body;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (!error && data) {
      res.status(201).json({ success: true, conversation: data });
      return;
    }
  }

  const db = getLocalDB();
  const newConv = {
    id: 'c-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    user_id: userId,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.conversations.unshift(newConv);
  // Initial assistant greeting
  db.messages.push({
    id: 'm-' + Date.now().toString(36),
    conversation_id: newConv.id,
    role: 'assistant',
    content: "Greetings! I'm your NEXORA AI Intelligence companion. How can I assist you with your productivity, learning roadmaps, schedules, or deep work today?",
    created_at: new Date().toISOString(),
  });
  saveLocalDB();

  res.status(201).json({ success: true, conversation: newConv });
});

// DELETE /api/ai/conversations/:id
router.delete('/conversations/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const convId = req.params.id;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', convId)
      .eq('user_id', userId);

    if (!error) {
      res.status(200).json({ success: true, message: 'Conversation deleted' });
      return;
    }
  }

  const db = getLocalDB();
  const idx = db.conversations.findIndex(c => c.id === convId && c.user_id === userId);
  if (idx !== -1) {
    db.conversations.splice(idx, 1);
    db.messages = db.messages.filter(m => m.conversation_id !== convId);
    saveLocalDB();
  }

  res.status(200).json({ success: true, message: 'Conversation deleted' });
});

// GET /api/ai/conversations/:id/messages
router.get('/conversations/:id/messages', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const convId = req.params.id;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      res.status(200).json({ success: true, messages: data });
      return;
    }
  }

  const db = getLocalDB();
  const messages = db.messages
    .filter(m => m.conversation_id === convId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  res.status(200).json({ success: true, messages });
});

// POST /api/ai/chat (send message & receive AI reply)
router.post('/chat', requireAuth, aiLimiter, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { conversationId, content, systemPrompt } = req.body;

  if (!content || typeof content !== 'string') {
    res.status(400).json({ success: false, error: 'Message content is required' });
    return;
  }

  const db = getLocalDB();
  let targetConvId = conversationId;

  // If no conversation provided, find or create one
  if (!targetConvId) {
    let conv = db.conversations.find(c => c.user_id === userId);
    if (!conv) {
      conv = {
        id: 'c-' + Date.now().toString(36),
        user_id: userId,
        title: content.slice(0, 32) + '...',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.conversations.unshift(conv);
    }
    targetConvId = conv.id;
  }

  // 1. Save user message
  const userMsg = {
    id: 'm-u-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
    conversation_id: targetConvId,
    role: 'user' as const,
    content,
    created_at: new Date().toISOString(),
  };
  db.messages.push(userMsg);

  // Retrieve message history for context
  const history = db.messages
    .filter(m => m.conversation_id === targetConvId)
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content }));

  // 2. Generate AI response (OpenAI or simulated fallback)
  const aiResult = await generateChatResponse(history, systemPrompt);

  // 3. Save assistant response
  const assistantMsg = {
    id: 'm-a-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
    conversation_id: targetConvId,
    role: 'assistant' as const,
    content: aiResult.content,
    created_at: new Date().toISOString(),
  };
  db.messages.push(assistantMsg);

  // Update conversation title if first message
  const conv = db.conversations.find(c => c.id === targetConvId);
  if (conv) {
    conv.updated_at = new Date().toISOString();
    if (conv.title === 'New Conversation') {
      conv.title = content.slice(0, 36) + (content.length > 36 ? '...' : '');
    }
  }

  saveLocalDB();

  res.status(200).json({
    success: true,
    message: assistantMsg,
    conversationId: targetConvId,
    isSimulated: aiResult.isSimulated,
  });
});

export default router;
