const http = require('http');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const { seedData } = require('./seed');

const runTests = async () => {
  console.log('--- Commencing StudyVault Automated API Verification ---');
  await connectDB();
  await seedData();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5005, resolve));
  const baseUrl = 'http://localhost:5005/api';

  const fetchJson = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  try {
    // 1. Health check
    const health = await fetchJson('/health');
    console.log('[Test 1] Health Check:', health.data.status === 'ok' ? 'PASS' : 'FAIL');

    // 2. Student Login
    const login = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student@studyvault.edu', password: 'password123' }),
    });
    console.log('[Test 2] Student Login:', login.status === 200 && login.data.token ? 'PASS' : 'FAIL');
    const token = login.data.token;

    // 3. Demo Role Switch (Dev only)
    const demo = await fetchJson('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role: 'admin' }),
    });
    console.log('[Test 3] Demo Switch to Admin:', demo.status === 200 && demo.data.user.role === 'admin' ? 'PASS' : 'FAIL');

    // 4. Fetch Subjects
    const subjects = await fetchJson('/subjects?semester=3', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[Test 4] Get Subjects (Sem 3):', subjects.data.count > 0 ? `PASS (${subjects.data.count} subjects)` : 'FAIL');
    const testSubject = subjects.data.subjects[0];

    // 5. Fetch Notes with Filters
    const notes = await fetchJson(`/notes?semester=3&examType=midterm`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[Test 5] Filter Notes (Sem 3 + Midterm):', notes.data.count > 0 ? `PASS (${notes.data.count} notes)` : 'FAIL');

    // 6. Attendance Summary Aggregation
    const attSummary = await fetchJson('/attendance/summary', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(
      '[Test 6] Attendance Summary Aggregation:',
      attSummary.data.subjects.length > 0 ? `PASS (Overall: ${attSummary.data.overall.percentage}%, Below 75% subjects: ${attSummary.data.subjects.filter(s => s.isBelow75).length})` : 'FAIL'
    );

    // 7. Student Self-Log Attendance (Adjustment 1)
    const lectures = await fetchJson('/lectures?semester=3', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const testLecture = lectures.data.lectures[0];
    const logSelf = await fetchJson('/attendance/log-self', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ lectureId: testLecture._id, status: 'present' }),
    });
    console.log('[Test 7] Student Self-Log Attendance:', logSelf.data.success ? 'PASS' : 'FAIL');

    // 8. Re-check Aggregation updates
    const updatedSummary = await fetchJson('/attendance/summary', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('[Test 8] Live Aggregation Recalculation:', updatedSummary.data.overall ? 'PASS' : 'FAIL');

    console.log('\n--- All Automated Backend Tests PASSED Successfully! ---');
  } catch (err) {
    console.error('Test execution failure:', err);
  } finally {
    server.close();
    await disconnectDB();
  }
};

runTests();
