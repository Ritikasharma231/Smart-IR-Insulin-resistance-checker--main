/**
 * Express + SQLite API for patients, auth, and assessments.
 * ML predictions remain on FastAPI (port 8000).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDb, run, get, all } = require('./db');
const {
  isProduction,
  loadAdminConfig,
  assertProductionSecrets,
} = require('./config/security');
const { validatePatientPassword } = require('./config/passwordPolicy');

const app = express();
const PORT = process.env.DATA_PORT || 3001;
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (isProduction() ? null : 'local-dev-only-' + require('crypto').randomBytes(24).toString('hex'));

let adminConfig = { configured: false, email: null, password: null };

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

const authLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const userToClient = (row) => ({
  id: row.id,
  userId: String(row.id),
  name: row.name,
  email: row.email,
  role: row.role,
  phone: row.phone || '',
  dateOfBirth: row.date_of_birth || '',
  notes: row.notes || '',
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || 'User')}&background=2563eb&color=fff`,
});

const assessmentFromRow = (row) => {
  const payload = JSON.parse(row.payload || '{}');
  return {
    id: row.id,
    userId: String(row.user_id),
    type: row.type,
    riskScore: row.risk_score ?? payload.riskScore,
    riskLevel: row.risk_level ?? payload.riskLevel,
    date: row.created_at || payload.date,
    patientEmail: row.patient_email,
    patientName: row.patient_name,
    ...payload,
  };
};

app.get('/api/health', async (_req, res) => {
  try {
    await get('SELECT 1 AS ok');
    res.json({ status: 'healthy', database: 'sqlite' });
  } catch (e) {
    res.status(503).json({ status: 'degraded', error: e.message });
  }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const pwCheck = validatePatientPassword(password);
    if (!pwCheck.valid) {
      return res.status(400).json({ error: pwCheck.errors[0] });
    }
    const normalized = email.trim().toLowerCase();
    if (adminConfig.configured && normalized === adminConfig.email) {
      return res.status(400).json({ error: 'This email cannot be used for registration' });
    }
    const existing = await get('SELECT id FROM users WHERE email = ?', [normalized]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      `INSERT INTO users (email, password_hash, name, role, phone) VALUES (?, ?, ?, 'patient', ?)`,
      [normalized, hash, name.trim(), phone || '']
    );
    const user = await get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: userToClient(user) });
  } catch (e) {
    console.error('register', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const normalized = email.trim().toLowerCase();
    const user = await get('SELECT * FROM users WHERE email = ?', [normalized]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: userToClient(user) });
  } catch (e) {
    console.error('login', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  const user = await get('SELECT * FROM users WHERE id = ?', [req.user.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: userToClient(user) });
});

app.get('/api/assessments', authenticate, async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'admin') {
      const userId = req.query.userId;
      if (userId) {
        rows = await all(
          `SELECT a.*, u.email AS patient_email, u.name AS patient_name
           FROM assessments a JOIN users u ON u.id = a.user_id
           WHERE a.user_id = ? ORDER BY a.created_at DESC`,
          [userId]
        );
      } else {
        rows = await all(
          `SELECT a.*, u.email AS patient_email, u.name AS patient_name
           FROM assessments a JOIN users u ON u.id = a.user_id
           ORDER BY a.created_at DESC`
        );
      }
    } else {
      rows = await all(
        `SELECT a.*, u.email AS patient_email, u.name AS patient_name
         FROM assessments a JOIN users u ON u.id = a.user_id
         WHERE a.user_id = ? ORDER BY a.created_at DESC`,
        [req.user.userId]
      );
    }
    res.json(rows.map(assessmentFromRow));
  } catch (e) {
    console.error('list assessments', e);
    res.status(500).json({ error: 'Failed to load assessments' });
  }
});

app.post('/api/assessments', authenticate, async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.role === 'admin' && data.userId ? Number(data.userId) : req.user.userId;
    const type = data.type || 'Basic';
    const riskScore = data.riskScore ?? data.risk_probability ?? null;
    const riskLevel = data.riskLevel || data.risk_category || null;

    const result = await run(
      `INSERT INTO assessments (user_id, type, payload, risk_score, risk_level) VALUES (?, ?, ?, ?, ?)`,
      [userId, type, JSON.stringify(data), riskScore, riskLevel]
    );
    const row = await get(
      `SELECT a.*, u.email AS patient_email, u.name AS patient_name
       FROM assessments a JOIN users u ON u.id = a.user_id WHERE a.id = ?`,
      [result.lastID]
    );
    res.status(201).json(assessmentFromRow(row));
  } catch (e) {
    console.error('save assessment', e);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

app.delete('/api/assessments/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.role === 'admin') {
      await run('DELETE FROM assessments WHERE id = ?', [id]);
    } else {
      await run('DELETE FROM assessments WHERE id = ? AND user_id = ?', [id, req.user.userId]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

app.get('/api/admin/patients', authenticate, requireAdmin, async (_req, res) => {
  try {
    const patients = await all(
      `SELECT u.*,
        (SELECT COUNT(*) FROM assessments WHERE user_id = u.id) AS assessment_count,
        (SELECT risk_level FROM assessments WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) AS latest_risk,
        (SELECT risk_score FROM assessments WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) AS latest_score,
        (SELECT created_at FROM assessments WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) AS latest_date
       FROM users u WHERE u.role = 'patient' ORDER BY u.updated_at DESC`
    );
    res.json(
      patients.map((p) => ({
        userId: String(p.id),
        name: p.name,
        email: p.email,
        phone: p.phone || '',
        dateOfBirth: p.date_of_birth || '',
        notes: p.notes || '',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        assessmentCount: p.assessment_count,
        latestRisk: p.latest_risk || '—',
        latestScore: p.latest_score,
        latestDate: p.latest_date,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: 'Failed to load patients' });
  }
});

app.get('/api/admin/stats', authenticate, requireAdmin, async (_req, res) => {
  const totalPatients = (await get(`SELECT COUNT(*) AS c FROM users WHERE role = 'patient'`)).c;
  const totalAssessments = (await get('SELECT COUNT(*) AS c FROM assessments')).c;
  const highRiskCount = (
    await get(
      `SELECT COUNT(*) AS c FROM assessments WHERE LOWER(risk_level) LIKE '%high%'`
    )
  ).c;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const assessmentsThisWeek = (
    await get(`SELECT COUNT(*) AS c FROM assessments WHERE created_at >= ?`, [
      weekAgo.toISOString(),
    ])
  ).c;
  res.json({ totalPatients, totalAssessments, highRiskCount, assessmentsThisWeek });
});

app.delete('/api/admin/patients/:userId', authenticate, requireAdmin, async (req, res) => {
  const userId = req.params.userId;
  await run('DELETE FROM assessments WHERE user_id = ?', [userId]);
  await run('DELETE FROM users WHERE id = ? AND role = ?', [userId, 'patient']);
  res.json({ success: true });
});

app.get('/api/admin/export', authenticate, requireAdmin, async (_req, res) => {
  const patients = await all(`SELECT id, name, email, phone, date_of_birth, notes, created_at FROM users WHERE role = 'patient'`);
  const assessments = await all('SELECT * FROM assessments');
  res.json({
    exportedAt: new Date().toISOString(),
    patients,
    assessments: assessments.map((a) => ({ ...a, payload: JSON.parse(a.payload || '{}') })),
  });
});

async function seedAdmin() {
  if (!adminConfig.configured) {
    console.warn(
      '[security] No admin account seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment / secrets manager.'
    );
    return;
  }

  const existing = await get('SELECT id FROM users WHERE email = ?', [adminConfig.email]);
  if (existing) {
    return;
  }

  const hash = await bcrypt.hash(adminConfig.password, 12);
  await run(
    `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, 'Administrator', 'admin')`,
    [adminConfig.email, hash]
  );
  console.log(`[security] Admin account provisioned for ${adminConfig.email} (password from environment only).`);
}

async function start() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required when NODE_ENV=production');
  }
  if (isProduction()) {
    assertProductionSecrets(JWT_SECRET);
  }

  adminConfig = loadAdminConfig();

  await initDb();
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`Data API running on http://localhost:${PORT}`);
    console.log(`Database: ${path.join(__dirname, 'data', 'smartir.db')}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
