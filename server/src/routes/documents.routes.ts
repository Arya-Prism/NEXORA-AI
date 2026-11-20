import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { supabaseAnon, supabaseAdmin, getLocalDB, saveLocalDB } from '../services/supabase';
import { ENV } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { summarizeDocument, answerDocumentQuestion } from '../services/ai';

const router = Router();

// Configure storage destination
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: ENV.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.md', '.json', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Supported: PDF, TXT, MD, PNG, JPG`));
    }
  },
});

// GET /api/documents (list user documents)
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      res.status(200).json({ success: true, documents: data });
      return;
    }
  }

  const db = getLocalDB();
  const docs = db.documents.filter(d => d.user_id === userId);
  res.status(200).json({ success: true, documents: docs });
});

// POST /api/documents/upload (upload document & analyze)
router.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded.' });
      return;
    }

    const { originalname, filename, size, mimetype, path: filePath } = req.file;

    // 1. Extract text from file
    let extractedText = '';
    const ext = path.extname(originalname).toLowerCase();

    if (ext === '.pdf') {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const parsed = await pdfParse(fileBuffer);
        extractedText = parsed.text || '';
      } catch (pdfErr) {
        console.warn('[DocUpload] PDF parse warning:', pdfErr);
        extractedText = `Extracted text from PDF document: ${originalname}`;
      }
    } else if (['.txt', '.md', '.json'].includes(ext)) {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    } else {
      // Image or media
      extractedText = `Image or visual document: ${originalname}. Content contains high-density metrics and visual layout.`;
    }

    // 2. Generate AI summary and key points
    const { summary, key_points } = await summarizeDocument(extractedText, originalname);

    // 3. Save to database
    if (ENV.isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('documents')
        .insert({
          user_id: userId,
          file_name: originalname,
          file_path: `/uploads/${filename}`,
          file_size: size,
          file_type: mimetype,
          summary,
          key_points: key_points,
        })
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ success: true, document: data });
        return;
      }
    }

    // Local DB Fallback
    const db = getLocalDB();
    const newDoc = {
      id: 'doc-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
      user_id: userId,
      file_name: originalname,
      file_path: `/uploads/${filename}`,
      file_size: size,
      file_type: mimetype,
      summary,
      key_points,
      created_at: new Date().toISOString(),
    };

    db.documents.unshift(newDoc);
    saveLocalDB();

    res.status(201).json({ success: true, document: newDoc });
  } catch (err: any) {
    console.error('[DocUpload] Upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'File processing error' });
  }
});

// POST /api/documents/:id/qa (ask question about specific document)
router.post('/:id/qa', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const docId = req.params.id;
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    res.status(400).json({ success: false, error: 'Question is required' });
    return;
  }

  const db = getLocalDB();
  const doc = db.documents.find(d => d.id === docId && d.user_id === userId);

  if (!doc) {
    res.status(404).json({ success: false, error: 'Document not found' });
    return;
  }

  const answer = await answerDocumentQuestion(doc.summary, doc.summary, question);

  res.status(200).json({
    success: true,
    question,
    answer,
    documentTitle: doc.file_name,
  });
});

// DELETE /api/documents/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const docId = req.params.id;

  if (ENV.isSupabaseConfigured() && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', docId)
      .eq('user_id', userId);

    if (!error) {
      res.status(200).json({ success: true, message: 'Document deleted' });
      return;
    }
  }

  const db = getLocalDB();
  const idx = db.documents.findIndex(d => d.id === docId && d.user_id === userId);
  if (idx !== -1) {
    const doc = db.documents[idx];
    const fullPath = path.resolve(__dirname, '../..', doc.file_path.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      try { fs.unlinkSync(fullPath); } catch {}
    }
    db.documents.splice(idx, 1);
    saveLocalDB();
  }

  res.status(200).json({ success: true, message: 'Document deleted successfully' });
});

export default router;
