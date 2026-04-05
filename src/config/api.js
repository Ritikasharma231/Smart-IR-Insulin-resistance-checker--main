// API Configuration for Insulin Tracker Backend Integration
// Update these URLs with your actual backend endpoints

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  // FastAPI Backend Endpoints
  BACKEND: {
    PREDICT: `${API_BASE_URL}/predict`,
    CHAT: `${API_BASE_URL}/chat`,
    HEALTH: `${API_BASE_URL}/`,
  },
  
  // Authentication Endpoints (if using backend-example.js)
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  
  // Assessment Endpoints
  ASSESSMENTS: {
    BASIC: '/api/assessments/basic',
    INTERMEDIATE: '/api/assessments/intermediate',
    ADVANCED: '/api/assessments/advanced',
    HISTORY: '/api/assessments/history',
    DELETE: '/api/assessments/:id'
  }
};

// Default export for easy import
export default API_ENDPOINTS;
