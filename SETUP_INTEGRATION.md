# Frontend-Backend Integration Setup Guide

## Overview

This guide will help you set up the complete Insulin Tracker application with React frontend connected to the FastAPI backend for AI-powered insulin resistance predictions.

## Prerequisites

- Node.js 14+ and npm
- Python 3.8+
- Git

## Quick Start

### Method 1: Automated Startup (Windows)

1. Double-click the `start.bat` file
2. Wait for both servers to start
3. Open your browser and go to `http://localhost:3000`

### Method 2: Manual Startup

#### Step 1: Install Python Dependencies

```bash
cd insulin_resistance_prediction-main
pip install -r requirements.txt
```

#### Step 2: Start the FastAPI Backend

```bash
cd insulin_resistance_prediction-main
python main.py
```

The backend will start at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/`

#### Step 3: Install Frontend Dependencies

```bash
cd ..
npm install
```

#### Step 4: Start the React Frontend

```bash
npm start
```

The frontend will start at `http://localhost:3000`

## Integration Features

### ✅ What's Connected

1. **AI-Powered Predictions**
   - All assessment types (Basic, Intermediate, Advanced) now call the FastAPI backend
   - Real machine learning predictions using trained models
   - SHAP explanations for risk factor analysis
   - AI-generated recommendations using Groq LLM

2. **Data Flow**
   - Frontend sends patient data to `/predict` endpoint
   - Backend processes data through ML models
   - Results include risk score, category, explanations, and recommendations
   - Fallback calculations if backend is unavailable

3. **Schema Mapping**
   - Frontend forms map to backend data schema
   - Proper data type conversion (sex: male/female → 1/0)
   - BMI calculation and validation
   - Error handling and user feedback

### 🔧 Configuration

#### Environment Variables (.env)

```env
GROQ_API_KEY=your_groq_api_key_here
REACT_APP_API_URL=http://localhost:8000
```

#### API Configuration (src/config/api.js)

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

### 📊 Assessment Types

#### Basic Assessment
- **Input**: Age, Sex, BMI, Waist Circumference
- **Model**: Basic ML model
- **Features**: 4 basic health metrics

#### Intermediate Assessment
- **Input**: Basic + Fasting Glucose, Triglycerides
- **Model**: Intermediate ML model with TyG index
- **Features**: 7 health metrics including blood markers

#### Advanced Assessment
- **Input**: Intermediate + HDL, Blood Pressure, Exercise
- **Model**: Advanced ML model with lifestyle factors
- **Features**: 10 comprehensive health metrics

### 🔄 Data Processing

1. **Frontend → Backend**
   ```javascript
   // Example mapping
   {
     model_type: "basic",
     Age: 35,
     Sex: 1,  // male=1, female=0
     BMI: 24.6,
     Waist: 92.0
   }
   ```

2. **Backend → Frontend**
   ```javascript
   // Example response
   {
     prediction: 0,
     label: "Normal",
     risk_category: "Low Risk",
     risk_probability: 15.5,
     top_risk_factors: [...],
     explanation: "AI-generated explanation..."
   }
   ```

### 🛡️ Error Handling

- **Network Errors**: Graceful fallback to local calculations
- **API Errors**: User-friendly error messages
- **Validation**: Form validation before API calls
- **Loading States**: Visual feedback during processing

### 📱 Features

1. **Authentication System**
   - Mock authentication (can be extended to real backend)
   - Session management with localStorage
   - Protected routes

2. **Assessment History**
   - Complete history tracking
   - Data visualization with charts
   - Export functionality
   - Delete individual assessments

3. **Results Dashboard**
   - Interactive charts and visualizations
   - AI-powered explanations
   - Personalized recommendations
   - Risk factor analysis

4. **User Profile**
   - Account management
   - Settings and preferences
   - Assessment statistics
   - Privacy controls

## Testing the Integration

### 1. Test Backend Health

```bash
curl http://localhost:8000/
```

Should return: `{"message": "API running"}`

### 2. Test Prediction Endpoint

```bash
curl -X POST "http://localhost:8000/predict" \
-H "Content-Type: application/json" \
-d '{
  "model_type": "basic",
  "Age": 35,
  "Sex": 1,
  "BMI": 24.6,
  "Waist": 92.0
}'
```

### 3. Test Frontend Integration

1. Open `http://localhost:3000`
2. Sign up for a new account
3. Complete a Basic Assessment
4. View the AI-powered results
5. Check the assessment history

## Troubleshooting

### Common Issues

1. **Backend Not Starting**
   - Check Python version (3.8+ required)
   - Install all dependencies: `pip install -r requirements.txt`
   - Verify GROQ API key is set in .env

2. **Frontend Not Connecting**
   - Ensure backend is running on port 8000
   - Check REACT_APP_API_URL in .env
   - Verify no firewall blocking the connection

3. **CORS Errors**
   - The FastAPI backend includes CORS middleware
   - If issues persist, check browser console for specific errors

4. **Missing Models**
   - Ensure model files exist in `insulin_resistance_prediction-main/model/`
   - Check that FAISS index files are present

### Debug Mode

For debugging, you can:

1. **Backend Logs**: Check terminal where FastAPI is running
2. **Frontend Logs**: Open browser developer tools (F12)
3. **Network Tab**: Monitor API calls in browser dev tools
4. **API Docs**: Visit `http://localhost:8000/docs` for interactive testing

## Production Deployment

### Backend Deployment

1. Set environment variables for production
2. Use a production ASGI server (Gunicorn + Uvicorn)
3. Configure proper CORS origins
4. Set up HTTPS

### Frontend Deployment

1. Build the React app: `npm run build`
2. Deploy to a static hosting service
3. Update REACT_APP_API_URL to production backend URL
4. Configure proper routing

## Next Steps

1. **Real Authentication**: Integrate with your preferred auth service
2. **Database Storage**: Replace localStorage with a real database
3. **Enhanced Security**: Add JWT tokens, rate limiting
4. **Mobile App**: Create React Native or PWA version
5. **Additional Features**: Telemedicine integration, wearable device sync

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure both frontend and backend are running
4. Check browser console for error messages
5. Review the API documentation at `http://localhost:8000/docs`

---

**Note**: This integration replaces all hardcoded logic with real AI-powered predictions from your FastAPI backend while maintaining fallback functionality for offline use.
