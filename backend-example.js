// Example Backend Server for Assessment Storage
// This is a reference implementation using Node.js, Express, and SQLite

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./assessments.db');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Assessments table
  db.run(`CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    risk_score INTEGER,
    risk_level TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', 
      [email, hashedPassword], 
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        
        const token = jwt.sign({ userId: this.lastID, email }, JWT_SECRET);
        res.json({ token, userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, userId: user.id });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Assessment endpoints
app.post('/api/assessments/basic', authenticateToken, async (req, res) => {
  try {
    const { age, sex, weight, height, waistCircumference, bmi } = req.body;
    
    // Calculate risk score (replace with your AI model)
    const riskScore = calculateBasicRiskScore({ age, sex, weight, height, waistCircumference, bmi });
    const riskLevel = riskScore < 30 ? 'Low' : riskScore < 60 ? 'Moderate' : 'High';
    
    // Save assessment
    const assessmentData = {
      age, sex, weight, height, waistCircumference, bmi,
      type: 'Basic',
      riskScore,
      riskLevel,
      date: new Date().toISOString()
    };
    
    db.run('INSERT INTO assessments (user_id, type, data, risk_score, risk_level) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, 'Basic', JSON.stringify(assessmentData), riskScore, riskLevel],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save assessment' });
        }
        
        res.json({
          riskScore,
          riskLevel,
          assessmentId: this.lastID
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Assessment failed' });
  }
});

app.post('/api/assessments/intermediate', authenticateToken, async (req, res) => {
  try {
    const assessmentData = req.body;
    
    // Calculate risk score (replace with your AI model)
    const riskScore = calculateIntermediateRiskScore(assessmentData);
    const riskLevel = riskScore < 30 ? 'Low' : riskScore < 60 ? 'Moderate' : 'High';
    
    const completeAssessment = {
      ...assessmentData,
      riskScore,
      riskLevel,
      date: new Date().toISOString()
    };
    
    db.run('INSERT INTO assessments (user_id, type, data, risk_score, risk_level) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, 'Intermediate', JSON.stringify(completeAssessment), riskScore, riskLevel],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save assessment' });
        }
        
        res.json({
          riskScore,
          riskLevel,
          assessmentId: this.lastID
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Assessment failed' });
  }
});

app.post('/api/assessments/advanced', authenticateToken, async (req, res) => {
  try {
    const assessmentData = req.body;
    
    // Calculate risk score (replace with your AI model)
    const riskScore = calculateAdvancedRiskScore(assessmentData);
    const riskLevel = riskScore < 30 ? 'Low' : riskScore < 60 ? 'Moderate' : 'High';
    
    const completeAssessment = {
      ...assessmentData,
      riskScore,
      riskLevel,
      date: new Date().toISOString()
    };
    
    db.run('INSERT INTO assessments (user_id, type, data, risk_score, risk_level) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, 'Advanced', JSON.stringify(completeAssessment), riskScore, riskLevel],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save assessment' });
        }
        
        res.json({
          riskScore,
          riskLevel,
          assessmentId: this.lastID
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Assessment failed' });
  }
});

// Get assessment history
app.get('/api/assessments/history', authenticateToken, (req, res) => {
  db.all('SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch assessments' });
      }
      
      const assessments = rows.map(row => ({
        id: row.id,
        ...JSON.parse(row.data),
        date: row.created_at
      }));
      
      res.json(assessments);
    }
  );
});

// Save assessment to history (used by AssessmentService)
app.post('/api/assessments/history', authenticateToken, (req, res) => {
  const assessmentData = req.body;
  
  db.run('INSERT INTO assessments (user_id, type, data, risk_score, risk_level) VALUES (?, ?, ?, ?, ?)',
    [req.user.userId, assessmentData.type, JSON.stringify(assessmentData), assessmentData.riskScore, assessmentData.riskLevel],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save assessment' });
      }
      
      res.json({
        id: this.lastID,
        ...assessmentData
      });
    }
  );
});

// Delete assessment
app.delete('/api/assessments/:id', authenticateToken, (req, res) => {
  const assessmentId = req.params.id;
  
  db.run('DELETE FROM assessments WHERE id = ? AND user_id = ?',
    [assessmentId, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete assessment' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Assessment not found' });
      }
      
      res.json({ message: 'Assessment deleted successfully' });
    }
  );
});

// Risk score calculation functions (replace with your AI models)
function calculateBasicRiskScore(data) {
  let score = 30;
  
  if (data.age > 45) score += 6;
  if (data.age > 60) score += 6;
  
  const bmi = parseFloat(data.bmi);
  if (bmi > 25) score += 10;
  if (bmi > 30) score += 10;
  
  const waist = parseFloat(data.waistCircumference);
  if (data.sex === 'male' && waist > 102) score += 6;
  if (data.sex === 'female' && waist > 88) score += 6;
  
  return Math.min(100, Math.max(0, score));
}

function calculateIntermediateRiskScore(data) {
  let score = calculateBasicRiskScore(data);
  
  const glucose = parseFloat(data.fastingGlucose);
  if (glucose > 100) score += 8;
  if (glucose > 126) score += 10;
  
  const triglycerides = parseFloat(data.triglycerides);
  if (triglycerides > 150) score += 8;
  if (triglycerides > 200) score += 6;
  
  return Math.min(100, Math.max(0, score));
}

function calculateAdvancedRiskScore(data) {
  let score = calculateIntermediateRiskScore(data);
  
  const hdl = parseFloat(data.hdl);
  if (data.sex === 'male' && hdl < 40) score += 8;
  if (data.sex === 'female' && hdl < 50) score += 8;
  
  const systolic = parseFloat(data.systolicBP);
  if (systolic > 130) score += 6;
  if (systolic > 140) score += 4;
  
  const diastolic = parseFloat(data.diastolicBP);
  if (diastolic > 85) score += 6;
  if (diastolic > 90) score += 4;
  
  // Exercise bonus
  const frequency = parseInt(data.exerciseFrequency);
  const intensity = data.exerciseIntensity;
  const duration = parseInt(data.exerciseDuration);
  
  let bonus = 0;
  if (frequency >= 5) bonus += 8;
  else if (frequency >= 3) bonus += 5;
  else if (frequency >= 1) bonus += 2;
  
  if (intensity === 'vigorous') bonus += 5;
  else if (intensity === 'moderate') bonus += 3;
  
  if (duration >= 60) bonus += 4;
  else if (duration >= 30) bonus += 2;
  
  score -= bonus;
  
  return Math.min(100, Math.max(0, score));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
