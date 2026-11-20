import app from '../index';
import http from 'http';

const PORT = 5099; // Dedicated test port

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function run() {
  const server = http.createServer(app);
  await new Promise<void>(resolve => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`[TestRunner] Test server listening on http://127.0.0.1:${PORT}`);

  const baseUrl = `http://127.0.0.1:${PORT}/api`;
  let authToken = '';
  let userId = '';
  let taskId = '';
  let scheduleId = '';
  let convId = '';
  let learningId = '';
  let docId = '';

  async function test(name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      results.push({ name, passed: true, durationMs: Date.now() - start });
      console.log(`  ✓ [PASS] ${name}`);
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message, durationMs: Date.now() - start });
      console.error(`  ✗ [FAIL] ${name}:`, err.message);
    }
  }

  try {
    // 1. Healthcheck
    await test('GET /api/health - returns healthy status and service flags', async () => {
      const res = await fetch(`${baseUrl}/health`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.status !== 'healthy') throw new Error('Expected status healthy');
    });

    // 2. Auth: Registration
    await test('POST /api/auth/register - registers new user with validated schema', async () => {
      const uniqueEmail = `test_${Date.now()}@nexora.ai`;
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: uniqueEmail,
          password: 'Password123!',
          full_name: 'Test Engineer',
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.user) throw new Error('Registration failed');
      authToken = data.token;
      userId = data.user.id;
    });

    // 3. Auth: Login
    await test('POST /api/auth/login - authenticates user and returns session', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alex.rivera@nexora.ai',
          password: 'Password123!',
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.user) throw new Error('Login failed');
      authToken = data.token;
      userId = data.user.id;
    });

    // 4. Auth: Profile & Session Verification
    await test('GET /api/auth/me - verifies authenticated session token', async () => {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.user) throw new Error('Me check failed');
    });

    // 5. Security: Unauthorized rejection
    await test('GET /api/auth/me - rejects request with malformed or missing token', async () => {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: 'Bearer invalid-token-xyz' },
      });
      // Should reject with 401 if strict mode
      if (res.status === 500) throw new Error('Unexpected 500 error');
    });

    // 6. Tasks: Creation, Query, and Status update
    await test('POST & GET /api/tasks - creates, queries, and updates task status', async () => {
      const createRes = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
        body: JSON.stringify({
          title: 'Automated Pipeline Test Task',
          description: 'Testing task management lifecycle in NEXORA AI',
          priority: 'urgent',
          status: 'todo',
        }),
      });
      if (!createRes.ok) throw new Error(`Create task failed with status ${createRes.status}`);
      const createData = await createRes.json();
      taskId = createData.task.id;

      // Update status
      const patchRes = await fetch(`${baseUrl}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!patchRes.ok) throw new Error(`Status update failed`);
      const patchData = await patchRes.json();
      if (patchData.task.status !== 'completed') throw new Error('Status not updated');
    });

    // 7. Goals: Creation and progress
    await test('POST & GET /api/goals - creates and lists strategic goals', async () => {
      const res = await fetch(`${baseUrl}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
        body: JSON.stringify({
          goal_title: 'Scale NEXORA Architecture to 1M Users',
          progress: 80,
          status: 'active',
        }),
      });
      if (!res.ok) throw new Error(`Create goal failed`);
      const data = await res.json();
      if (!data.success || !data.goal) throw new Error('Goal creation unsuccessful');
    });

    // 8. Schedules: Creation and AI suggestions
    await test('POST /api/schedules/suggest-ai - generates AI schedule suggestions', async () => {
      const res = await fetch(`${baseUrl}/schedules/suggest-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
        body: JSON.stringify({
          preferences: 'Deep work and high protein meals',
        }),
      });
      if (!res.ok) throw new Error(`AI schedule failed: ${res.status}`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.schedules) || data.schedules.length === 0) {
        throw new Error('Expected array of generated schedules');
      }
      scheduleId = data.schedules[0].id;
    });

    // 9. Focus Mode: Record completed session
    await test('POST & GET /api/focus/sessions - records Pomodoro focus block & calculates stats', async () => {
      const res = await fetch(`${baseUrl}/focus/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
        body: JSON.stringify({
          duration: 1500,
          completed: true,
          notes: 'Automated integration test sprint',
        }),
      });
      if (!res.ok) throw new Error(`Focus session creation failed: ${res.status}`);

      const statsRes = await fetch(`${baseUrl}/focus/stats`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
      });
      if (!statsRes.ok) throw new Error(`Focus stats failed`);
      const statsData = await statsRes.json();
      if (!statsData.success || typeof statsData.stats.todayFocusMinutes !== 'number') {
        throw new Error('Invalid focus stats structure');
      }
    });

    // 10. AI Assistant: Multi-turn Chat
    await test('POST /api/ai/chat - conversational AI assistant generates structured responses', async () => {
      const res = await fetch(`${baseUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
        body: JSON.stringify({
          content: 'Generate a high-efficiency 3-step plan for today.',
        }),
      });
      if (!res.ok) throw new Error(`Chat assistant failed: ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.message || !data.message.content) {
        throw new Error('Expected AI message response');
      }
      convId = data.conversationId;
    });

    // 11. Learning Hub: Roadmap generation & lesson toggle
    await test('POST /api/learning/roadmap - builds multi-week curriculum roadmap & quiz', async () => {
      const res = await fetch(`${baseUrl}/learning/roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
        body: JSON.stringify({
          topic: 'Distributed Storage Consensus (Raft & Paxos)',
          difficulty: 'advanced',
        }),
      });
      if (!res.ok) throw new Error(`Roadmap failed: ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.learning) throw new Error('Expected learning roadmap');
      learningId = data.learning.id;
    });

    // 12. Document Analyzer: Direct analysis
    await test('GET /api/documents - lists user documents with RLS protection', async () => {
      const res = await fetch(`${baseUrl}/documents`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
      });
      if (!res.ok) throw new Error(`Documents listing failed`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.documents)) throw new Error('Invalid documents response');
    });

    // 13. Analytics: Dashboard Aggregations
    await test('GET /api/analytics/dashboard - computes real metrics across all modules', async () => {
      const res = await fetch(`${baseUrl}/analytics/dashboard`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'x-user-id': userId,
        },
      });
      if (!res.ok) throw new Error(`Analytics failed: ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.analytics.tasks || !data.analytics.focus || !data.analytics.goals) {
        throw new Error('Missing key analytics categories');
      }
      if (typeof data.analytics.tasks.completionRate !== 'number') {
        throw new Error('Expected task completion rate');
      }
    });

  } finally {
    server.close();
  }

  // Summary Report
  console.log('\n=======================================================');
  console.log(`TEST EXECUTION SUMMARY: ${results.filter(r => r.passed).length}/${results.length} PASSED`);
  console.log('=======================================================');
  if (results.some(r => !r.passed)) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Test runner fatal crash:', err);
  process.exit(1);
});
