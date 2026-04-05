# API Integration Guide for Insulin Tracker

This document explains how to connect your AI models to the Insulin Tracker frontend application.

## Overview

The frontend is now ready to connect to your AI models. All dummy data has been removed and replaced with API calls that expect your backend to provide AI-powered risk assessments.

## API Endpoints Configuration

All API endpoints are configured in `src/config/api.js`. Update this file with your actual backend URLs.

### Authentication Endpoints

```javascript
AUTH: {
  LOGIN: '/api/auth/login',           // POST - User login
  REGISTER: '/api/auth/register',       // POST - User registration
  LOGOUT: '/api/auth/logout',           // POST - User logout
  REFRESH: '/api/auth/refresh'          // POST - Refresh token
}
```

### Assessment Endpoints

```javascript
ASSESSMENTS: {
  BASIC: '/api/assessments/basic',         // POST - Basic assessment
  INTERMEDIATE: '/api/assessments/intermediate', // POST - Intermediate assessment  
  ADVANCED: '/api/assessments/advanced',       // POST - Advanced assessment
  HISTORY: '/api/assessments/history',        // GET - User assessment history
  DELETE: '/api/assessments/:id'             // DELETE - Delete assessment
}
```

## Request/Response Formats

### Basic Assessment Request

```json
{
  "age": 35,
  "sex": "male",
  "weight": 75.5,
  "height": 175,
  "waistCircumference": 92,
  "bmi": 24.6,
  "type": "Basic",
  "date": "2024-03-22T10:30:00.000Z"
}
```

### Intermediate Assessment Request

Includes all basic fields plus:

```json
{
  "fastingGlucose": 95,
  "triglycerides": 120
}
```

### Advanced Assessment Request

Includes all intermediate fields plus:

```json
{
  "hdl": 45,
  "systolicBP": 125,
  "diastolicBP": 82,
  "exerciseFrequency": 3,
  "exerciseIntensity": "moderate",
  "exerciseDuration": 30
}
```

### Expected Response Format

```json
{
  "riskScore": 35,
  "riskLevel": "Low",
  "recommendations": [
    {
      "category": "Weight Management",
      "priority": "medium",
      "items": [
        "Maintain current weight",
        "Continue regular exercise"
      ]
    }
  ],
  "insights": [
    {
      "type": "positive",
      "message": "Your BMI is within healthy range"
    }
  ],
  "nextAssessmentDate": "2024-06-22T00:00:00.000Z"
}
```

## AI Model Integration Examples

### Basic Assessment AI Model

```javascript
// Your backend endpoint handler
app.post('/api/assessments/basic', async (req, res) => {
  try {
    const { age, sex, weight, height, waistCircumference, bmi } = req.body;
    
    // Call your AI model
    const aiResult = await yourBasicAssessmentModel({
      age, sex, weight, height, waistCircumference, bmi
    });
    
    res.json({
      riskScore: aiResult.riskScore,           // 0-100
      riskLevel: aiResult.riskLevel,         // "Low" | "Moderate" | "High"
      recommendations: aiResult.recommendations, // Array of recommendation objects
      insights: aiResult.insights             // Array of insight objects (optional)
    });
  } catch (error) {
    res.status(500).json({ error: 'Assessment failed' });
  }
});
```

### Intermediate Assessment AI Model

```javascript
app.post('/api/assessments/intermediate', async (req, res) => {
  try {
    const assessmentData = req.body;
    
    // Call your intermediate AI model
    const aiResult = await yourIntermediateAssessmentModel(assessmentData);
    
    res.json({
      riskScore: aiResult.riskScore,
      riskLevel: aiResult.riskLevel,
      recommendations: aiResult.recommendations,
      insights: aiResult.insights
    });
  } catch (error) {
    res.status(500).json({ error: 'Assessment failed' });
  }
});
```

### Advanced Assessment AI Model

```javascript
app.post('/api/assessments/advanced', async (req, res) => {
  try {
    const assessmentData = req.body;
    
    // Call your advanced AI model
    const aiResult = await yourAdvancedAssessmentModel(assessmentData);
    
    res.json({
      riskScore: aiResult.riskScore,
      riskLevel: aiResult.riskLevel,
      recommendations: aiResult.recommendations,
      insights: aiResult.insights
    });
  } catch (error) {
    res.status(500).json({ error: 'Assessment failed' });
  }
});
```

## Authentication Integration

### Login Endpoint

```javascript
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Authenticate user
    const user = await authenticateUser(email, password);
    
    if (user) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});
```

### Registration Endpoint

```javascript
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Create new user
    const user = await createUser({ name, email, password });
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});
```

## Frontend Changes Made

### ✅ Removed Dummy Data
- Removed hardcoded user data in Login/Signup
- Removed hardcoded assessment scores
- Removed hardcoded dashboard statistics
- Removed hardcoded recent activity

### ✅ Added API Integration Points
- All assessment forms now make API calls to your AI models
- Authentication forms call your backend endpoints
- Dashboard loads real data from localStorage
- Results page expects AI-generated recommendations

### ✅ Fallback Behavior
- If API calls fail, forms fallback to local calculations
- App remains functional even without backend
- Graceful error handling with user feedback

## Next Steps

1. **Implement Backend API** - Create the endpoints listed above
2. **Connect AI Models** - Integrate your assessment algorithms
3. **Update API Configuration** - Set your actual backend URLs in `src/config/api.js`
4. **Test Integration** - Verify all assessment types work correctly
5. **Deploy** - Deploy both frontend and backend

## Data Flow

1. User completes assessment form
2. Frontend sends data to your AI model endpoint
3. AI model processes data and returns risk assessment
4. Frontend displays results with recommendations
5. Assessment is saved to localStorage for history

## Error Handling

The frontend includes comprehensive error handling:
- Network failures show user-friendly messages
- API errors are logged and displayed
- Fallback calculations ensure app functionality
- Loading states provide user feedback

## Support

For questions about integration, refer to:
- `src/config/api.js` - API endpoint configuration
- Individual assessment files - Form handling logic
- Authentication files - Login/signup flow

The frontend is now fully prepared for your AI model integration!
