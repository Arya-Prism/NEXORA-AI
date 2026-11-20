-- ==========================================================
-- NEXORA AI – Supabase Seed Data
-- ==========================================================

-- Example Demo Seed Data (Can be run after creating a demo user in Supabase auth)
-- Note: Replace '<YOUR-USER-UUID>' with your test user's UUID if running manually.

/*
INSERT INTO public.tasks (user_id, title, description, priority, status, due_date) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Complete AI System Architecture Documentation', 'Finalize system design diagrams and schema for Nexora AI platform', 'urgent', 'in_progress', NOW() + INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', 'Prepare for Advanced Algorithms Seminar', 'Review dynamic programming and graph theory problem sets', 'high', 'todo', NOW() + INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000001', 'Sync with Research Lab Advisor', 'Weekly progress update on multimodal vision and document embeddings', 'medium', 'completed', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', 'Daily Hydration & Macro Intake Check', 'Ensure 2.8L water target and 130g protein goal are met', 'low', 'completed', NOW());

INSERT INTO public.goals (user_id, goal_title, description, target_date, progress, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Master Distributed Systems & Cloud Architecture', 'Complete 12 modules including Spanner, Kafka, and Kubernetes', NOW() + INTERVAL '30 days', 65, 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Maintain 21-Day Deep Focus & Habit Streak', 'Complete at least four 25-minute Pomodoro focus blocks daily', NOW() + INTERVAL '14 days', 75, 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Publish Research Paper on Generative UI', 'Draft conference submission on adaptive user interface synthesis', NOW() + INTERVAL '60 days', 30, 'active');

INSERT INTO public.schedules (user_id, title, start_time, end_time, date, category) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Deep Work: Backend API Gateway Engineering', '09:00', '11:00', CURRENT_DATE, 'work'),
  ('00000000-0000-0000-0000-000000000001', 'Metabolic Fuel: High Protein Meal & Walk', '12:30', '13:30', CURRENT_DATE, 'health'),
  ('00000000-0000-0000-0000-000000000001', 'AI Learning Hub: Transformers & Attention Mechanisms', '14:30', '16:00', CURRENT_DATE, 'study'),
  ('00000000-0000-0000-0000-000000000001', 'Daily Sync & Task Review', '17:00', '17:30', CURRENT_DATE, 'personal');

INSERT INTO public.focus_sessions (user_id, duration, completed, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', 1500, true, 'Sprint on database schema and RLS policies'),
  ('00000000-0000-0000-0000-000000000001', 1500, true, 'Implemented JWT auth verification middleware'),
  ('00000000-0000-0000-0000-000000000001', 1800, true, 'Tested OpenAI streaming completion endpoint');

INSERT INTO public.learning_progress (user_id, topic, difficulty, progress, completed_lessons, roadmap) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Neural Attention & Transformers', 'advanced', 80, 
   '[{"id":1,"title":"Self-Attention Foundations","completed":true},{"id":2,"title":"Multi-Head Attention Mathematics","completed":true},{"id":3,"title":"Positional Encodings","completed":true},{"id":4,"title":"Flash Attention Optimizations","completed":false}]'::jsonb,
   '[{"week":1,"title":"Foundations","description":"Vector embeddings, dot product attention"},{"week":2,"title":"Architecture","description":"Encoder-decoder vs decoder-only"},{"week":3,"title":"Optimization","description":"Quantization, KV caching"}]'::jsonb);
*/
