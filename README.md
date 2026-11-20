# NEXORA AI – Your Personal AI Life & Productivity Intelligence Platform

> Full-stack production-grade AI platform transformed from a Google Stitch prototype into a complete, secure, and reactive web application.

---

## 🌟 Executive Overview & Visual Identity

**NEXORA AI** is an intelligent personal life operating system engineered for ambitious researchers, students, and professionals. It bridges cognitive productivity with metabolic bio-rhythms, uniting:

- **AI Conversational Assistant:** Context-aware assistant powered by OpenAI API for deep conceptual breakdowns, schedule generation, task prioritization, and learning roadmaps.
- **Smart Weekly Planner:** Day-by-day calendar synchronized with high-cognition focus blocks, meal planning, and budget/prep-time filters.
- **Task Management Board:** Full 3-column Kanban board (To-do, In Progress, Completed) with deadline tracking, urgency prioritization, and database persistence.
- **AI Learning Hub:** Generates multi-week structured curricula on any technical topic, progressive unit checkpoints, and interactive quizzes with instant answer evaluation.
- **Document & Multimodal Plate Vision Analyzer:** Secure PDF and image upload, text extraction, executive summarization, key takeaway cards, and contextual Q&A chat with documents.
- **Focus Mode & Pomodoro Intelligence:** Precision circular countdown timer with 25m/50m/custom intervals, confetti celebrations, session logs, and daily productivity streak calculation.
- **Real-Time Analytics Dashboard:** Database-driven telemetry with task completion rates, weekly productivity bar charts, goal tracking, and chronological activity feeds.
- **Dual Visual Identity System:**
  - **Organic Botanical Emerald (Stitch Prototype):** Forest `#144331`, Emerald `#10B981`, soft glassmorphic cards (`backdrop-blur-xl`, `bg-white/85`), and Plus Jakarta Sans + Inter typography.
  - **Midnight Cyber Violet (Nexora Dark Theme):** Midnight Navy `#0B0F19`, Electric Violet `#8B5CF6`, and Cyber Cyan `#06B6D4` with ambient radial glows.
  - One-click instant theme toggle in the navigation header!

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Canvas Confetti |
| **Backend API** | Node.js (v24), Express.js, TypeScript, tsx, CORS, Helmet, Rate-Limit, Zod |
| **Database** | Supabase PostgreSQL, Row Level Security (RLS), Automatic Triggers, Indexes |
| **Authentication** | Supabase Authentication (Email/Password, JWT validation, Session persistence) |
| **AI Integration** | OpenAI API (`gpt-4o-mini` / `gpt-4o`), Structured JSON schemas, Fallback engine |
| **Document Processing** | Multer, PDF-Parse, Buffer extraction |
| **Deployment** | Vercel (Frontend), Docker / Render / Railway (Backend) |

---

## 🗄️ Database Architecture (Phase 4)

The database schema (`supabase/schema.sql`) implements 9 core tables with complete Row Level Security (RLS) policies:

1. **`profiles`**: `id (UUID PK, references auth.users)`, `full_name`, `email`, `avatar_url`, `theme_preference`, `created_at`, `updated_at`.
2. **`tasks`**: `id`, `user_id (FK)`, `title`, `description`, `priority ('low'|'medium'|'high'|'urgent')`, `status ('todo'|'in_progress'|'completed')`, `due_date`, `created_at`.
3. **`goals`**: `id`, `user_id (FK)`, `goal_title`, `description`, `target_date`, `progress (0-100)`, `status ('active'|'achieved'|'paused')`, `created_at`.
4. **`schedules`**: `id`, `user_id (FK)`, `title`, `start_time`, `end_time`, `date`, `category ('work'|'study'|'health'|'personal'|'focus')`, `created_at`.
5. **`focus_sessions`**: `id`, `user_id (FK)`, `duration (seconds)`, `completed (boolean)`, `task_id`, `notes`, `created_at`.
6. **`conversations`**: `id`, `user_id (FK)`, `title`, `created_at`, `updated_at`.
7. **`messages`**: `id`, `conversation_id (FK)`, `role ('user'|'assistant'|'system')`, `content`, `created_at`.
8. **`documents`**: `id`, `user_id (FK)`, `file_name`, `file_path`, `file_size`, `file_type`, `summary`, `key_points (JSONB)`, `created_at`.
9. **`learning_progress`**: `id`, `user_id (FK)`, `topic`, `difficulty`, `progress (0-100)`, `completed_lessons (JSONB)`, `roadmap (JSONB)`, `created_at`.

### Row Level Security (RLS)
Every table enforces RLS. Users can strictly only read, create, update, and delete their own records (`auth.uid() = user_id`). Foreign key cascade rules ensure that deleting a user account cleans up all associated records cleanly.

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- Node.js v18+ or v20+ (Tested on Node v24.22.1)
- npm v9+

### 1. Installation
Clone or navigate to the repository directory:
```bash
cd "d:\NUTROLO AI"

# Install all dependencies (both backend and frontend)
npm run install:all
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your credentials (see Configuration Guide below).

### 3. Build & Test
```bash
# Build backend TypeScript
npm run build:server

# Build frontend Vite production bundle
npm run build:client

# Run the automated 13-point integration test suite
cd server && npm test
```

### 4. Running the Development Servers
In two separate terminal tabs (or via background runner):

**Terminal 1 (Backend API):**
```bash
npm run dev:server
# Server will listen on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Vite client will launch on http://localhost:5173
```

Open your browser at `http://localhost:5173` to explore the live application.

---

## 🔑 Environment Configuration Guide

Enter these variables in your `.env` file:

| Variable | Required | Where to Obtain | Purpose |
|---|---|---|---|
| `PORT` | Yes (default `5000`) | Set locally | Express API server listening port |
| `CLIENT_URL` | Yes (default `http://localhost:5173`) | Set locally | CORS allowed origin for frontend |
| `SUPABASE_URL` | For Cloud DB | [supabase.com](https://app.supabase.com) -> Settings -> API | Connection endpoint for PostgreSQL & Auth |
| `SUPABASE_ANON_KEY` | For Cloud DB | [supabase.com](https://app.supabase.com) -> Settings -> API | Public client key for user authentication |
| `SUPABASE_SERVICE_ROLE_KEY` | For Admin DB | [supabase.com](https://app.supabase.com) -> Settings -> API | Private server key for backend database queries |
| `OPENAI_API_KEY` | For Live AI | [platform.openai.com](https://platform.openai.com/api-keys) | Enables GPT-4o conversational intelligence & vision |
| `OPENAI_MODEL` | Optional (default `gpt-4o-mini`) | OpenAI Model ID | Model selection for speed and cost efficiency |

> **Graceful Offline / Local Mode:** If `SUPABASE_URL` or `OPENAI_API_KEY` are not yet configured, NEXORA AI operates seamlessly in **Local Intelligent Mode** using persistent local JSON storage and structured simulated AI responses, allowing 100% of pages, forms, timers, and boards to be tested immediately without API keys!

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register new user with email, password, and full name.
- `POST /api/auth/login` – Login user and return session token.
- `POST /api/auth/reset-password` – Trigger password reset workflow.
- `GET /api/auth/me` – Verify current session and retrieve profile.
- `PUT /api/auth/profile` – Update full name, avatar, or theme preference.

### Tasks (`/api/tasks`)
- `GET /api/tasks` – List tasks with optional query filters (`?status=todo&priority=urgent&search=...`).
- `POST /api/tasks` – Create new task (`title`, `description`, `priority`, `status`, `due_date`).
- `PUT /api/tasks/:id` – Update task fields.
- `PATCH /api/tasks/:id/status` – Quick status toggle (`todo`, `in_progress`, `completed`).
- `DELETE /api/tasks/:id` – Delete task.

### Smart Planner (`/api/schedules`)
- `GET /api/schedules` – Fetch schedule items by date or category.
- `POST /api/schedules` – Create schedule item (`start_time`, `end_time`, `title`, `category`).
- `PUT /api/schedules/:id` – Edit schedule item.
- `DELETE /api/schedules/:id` – Remove schedule item.
- `POST /api/schedules/suggest-ai` – AI generates optimized balanced day schedule.

### Goals (`/api/goals`)
- `GET /api/goals` – List user goals.
- `POST /api/goals` – Create goal with target date and target progress.
- `PUT /api/goals/:id` – Update goal progress or status.
- `DELETE /api/goals/:id` – Remove goal.

### Focus Mode (`/api/focus`)
- `GET /api/focus/sessions` – Retrieve chronological focus history.
- `POST /api/focus/sessions` – Record completed Pomodoro sprint (`duration`, `completed`, `notes`).
- `GET /api/focus/stats` – Get daily focus minutes, total hours, and streak count.

### AI Assistant (`/api/ai`)
- `GET /api/ai/conversations` – List conversation threads.
- `POST /api/ai/conversations` – Create new conversation.
- `DELETE /api/ai/conversations/:id` – Delete conversation and associated messages.
- `GET /api/ai/conversations/:id/messages` – Fetch conversation message history.
- `POST /api/ai/chat` – Send message, generate AI reply, and persist interaction.

### AI Learning Hub (`/api/learning`)
- `GET /api/learning` – List learning curricula.
- `POST /api/learning/roadmap` – Generate multi-week syllabus and quiz for topic.
- `PATCH /api/learning/:id/lesson` – Mark lesson complete / incomplete and recalculate mastery %.

### Document Analyzer (`/api/documents`)
- `POST /api/documents/upload` – Multipart file upload (PDF, TXT, MD, PNG, JPG). Extracts text and produces AI summary.
- `GET /api/documents` – List user uploaded documents.
- `POST /api/documents/:id/qa` – Ask contextual questions about an uploaded document.
- `DELETE /api/documents/:id` – Delete document and physical file.

### Analytics (`/api/analytics`)
- `GET /api/analytics/dashboard` – Real-time computed aggregations across tasks, goals, focus sprints, and learning progress.

---

## 🧪 Testing Results (Phase 14)

Automated end-to-end integration tests verify all core endpoints:

```text
[TestRunner] Test server listening on http://127.0.0.1:5099
  ✓ [PASS] GET /api/health - returns healthy status and service flags
  ✓ [PASS] POST /api/auth/register - registers new user with validated schema
  ✓ [PASS] POST /api/auth/login - authenticates user and returns session
  ✓ [PASS] GET /api/auth/me - verifies authenticated session token
  ✓ [PASS] GET /api/auth/me - rejects request with malformed or missing token
  ✓ [PASS] POST & GET /api/tasks - creates, queries, and updates task status
  ✓ [PASS] POST & GET /api/goals - creates and lists strategic goals
  ✓ [PASS] POST /api/schedules/suggest-ai - generates AI schedule suggestions
  ✓ [PASS] POST & GET /api/focus/sessions - records Pomodoro focus block & calculates stats
  ✓ [PASS] POST /api/ai/chat - conversational AI assistant generates structured responses
  ✓ [PASS] POST /api/learning/roadmap - builds multi-week curriculum roadmap & quiz
  ✓ [PASS] GET /api/documents - lists user documents with RLS protection
  ✓ [PASS] GET /api/analytics/dashboard - computes real metrics across all modules

=======================================================
TEST EXECUTION SUMMARY: 13/13 PASSED (100% SUCCESS RATE)
=======================================================
```

---

## 🚢 Deployment (Phase 15)

### Frontend on Vercel
1. Import the repository in Vercel.
2. Set Root Directory to `client`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. `client/vercel.json` is pre-configured with SPA route rewrites.

### Backend on Render / Railway / Node.js Host
1. Connect repository with Root Directory set to `server`.
2. Build command: `npm run build`
3. Start command: `node dist/index.js`
4. Add environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `CLIENT_URL`.

### Containerized Deployment (Docker)
Run the entire platform with one command:
```bash
docker-compose up --build
```
Client: `http://localhost:5173` | Server: `http://localhost:5000`
