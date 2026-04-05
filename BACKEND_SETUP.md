# Backend Setup for Assessment Storage

This guide will help you set up the backend server to store all user assessments in a database, enabling users to view their complete assessment history.

## Features

- **User Authentication**: Secure JWT-based authentication
- **Assessment Storage**: Store all assessment types (Basic, Intermediate, Advanced)
- **Assessment History**: Retrieve complete assessment history for any user
- **Data Persistence**: SQLite database for reliable data storage
- **Fallback Support**: Graceful fallback to localStorage if backend is unavailable

## Quick Setup

### 1. Install Dependencies

```bash
# Copy the backend package.json
cp backend-package.json package.json

# Install dependencies
npm install
```

### 2. Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

### 3. Configure Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here
REACT_APP_BACKEND_URL=http://localhost:3001
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Assessments
- `POST /api/assessments/basic` - Submit basic assessment
- `POST /api/assessments/intermediate` - Submit intermediate assessment  
- `POST /api/assessments/advanced` - Submit advanced assessment
- `GET /api/assessments/history` - Get user's assessment history
- `POST /api/assessments/history` - Save assessment to history
- `DELETE /api/assessments/:id` - Delete specific assessment

## Frontend Integration

The frontend is already configured to work with the backend through the `AssessmentService`. Here's how it works:

### Automatic Backend Integration

1. **Assessment Submission**: When users complete any assessment, it's automatically sent to the backend
2. **History Loading**: The History page loads data from the backend first, falls back to localStorage
3. **Data Persistence**: All assessments are stored in the SQLite database
4. **Error Handling**: Graceful degradation if backend is unavailable

### Service Features

The `AssessmentService` provides:

```javascript
// Submit assessment and save to history
await AssessmentService.submitAssessment(data, 'Advanced');

// Get complete assessment history
const history = await AssessmentService.getAssessmentHistory();

// Delete specific assessment
await AssessmentService.deleteAssessment(assessmentId);
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Assessments Table
```sql
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  data TEXT NOT NULL,
  risk_score INTEGER,
  risk_level TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Cross-origin request sharing configured
- **Input Validation**: All inputs are validated before processing
- **SQL Injection Protection**: Parameterized queries prevent SQL injection

## Testing the Backend

### Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Assessment Submission
```bash
curl -X POST http://localhost:3001/api/assessments/basic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "age": 30,
    "sex": "male",
    "weight": 70,
    "height": 175,
    "waistCircumference": 85,
    "bmi": 22.9
  }'
```

## Deployment

### Production Deployment

1. **Set Environment Variables**:
   ```env
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   PORT=3001
   ```

2. **Use Process Manager** (recommended):
   ```bash
   npm install -g pm2
   pm2 start backend-example.js --name insulin-tracker-api
   ```

3. **Configure Reverse Proxy** (nginx example):
   ```nginx
   location /api {
       proxy_pass http://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
   }
   ```

## Monitoring and Maintenance

### Database Backups
```bash
# Backup SQLite database
cp assessments.db backups/assessments-$(date +%Y%m%d).db

# Automated backup script
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DB_FILE="assessments.db"
DATE=$(date +%Y%m%d_%H%M%S)

cp $DB_FILE $BACKUP_DIR/assessments-$DATE.db
# Keep only last 30 days of backups
find $BACKUP_DIR -name "assessments-*.db" -mtime +30 -delete
```

### Health Check Endpoint
Add to backend for monitoring:
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure frontend URL is allowed in CORS configuration
2. **Database Locked**: Restart server to release database locks
3. **Token Expired**: Implement token refresh mechanism
4. **Port Already in Use**: Change PORT in environment variables

### Logging
Add comprehensive logging:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Next Steps

1. **AI Model Integration**: Replace risk score calculations with actual AI models
2. **Email Notifications**: Send assessment results via email
3. **Data Analytics**: Add analytics endpoints for insights
4. **Mobile API**: Optimize for mobile app consumption
5. **Data Export**: Add CSV/PDF export functionality

## Support

If you encounter any issues setting up the backend:

1. Check the console logs for error messages
2. Ensure all dependencies are installed correctly
3. Verify database permissions
4. Check network connectivity and firewall settings

The backend is designed to be robust and scalable, handling multiple users and assessments efficiently while maintaining data security and integrity.
