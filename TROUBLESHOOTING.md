# 🚨 Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend Connection Errors

**Error:** `Failed to load resource: net::ERR_CONNECTION_REFUSED`

**Solution:**
- The FastAPI backend is not running
- Run `start.bat` to start both frontend and backend
- Or manually start the backend:
  ```bash
  cd insulin_resistance_prediction-main
  python -m venv venv
  venv\Scripts\activate
  pip install -r requirements.txt
  python main.py
  ```

### 2. Favicon Errors

**Error:** `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`

**Solution:**
- This is fixed! We've replaced favicon.ico with favicon.png
- Clear your browser cache and refresh the page

### 3. Password Autocomplete Warnings

**Warning:** `Input elements should have autocomplete attributes`

**Solution:**
- ✅ Fixed! Added proper autocomplete attributes:
  - Login: `autocomplete="current-password"`
  - Signup: `autocomplete="new-password"`

### 4. Assessment API Errors

**Error:** `API Error: TypeError: Failed to fetch`

**Solution:**
- The application now has fallback support
- If backend is unavailable, it uses offline calculations
- Start the backend for full AI-powered predictions

### 5. Chatbot Connection Issues

**Error:** `Chatbot error: TypeError: Failed to fetch`

**Solution:**
- Chatbot has fallback responses when backend is unavailable
- Start the backend for full AI chatbot functionality
- Backend provides RAG + LLM powered responses

## 🚀 Quick Start

### Method 1: Use the Launcher (Recommended)
```bash
# Double-click or run:
start.bat
```

### Method 2: Manual Start

**Backend:**
```bash
cd insulin_resistance_prediction-main
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Frontend:**
```bash
# In a new terminal:
npm start
```

## 🔧 System Requirements

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **Internet connection** (for AI models)

## 📋 Environment Setup

### Backend Environment Variables
Create `.env` file in `insulin_resistance_prediction-main/`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### Frontend Environment Variables
Create `.env` file in project root:
```env
REACT_APP_API_URL=http://localhost:8000
```

## 🤖 AI Features Status

| Feature | Status | Requires Backend |
|---------|--------|------------------|
| ML Predictions | ✅ Working | Yes |
| SHAP Explanations | ✅ Working | Yes |
| RAG System | ✅ Working | Yes |
| LLM Responses | ✅ Working | Yes |
| Chatbot | ✅ Working | Yes |
| Fallback Mode | ✅ Working | No |

## 🐛 Debug Mode

To enable debug logging:
1. Open browser DevTools (F12)
2. Check Console tab
3. Look for:
   - `Backend health check failed`
   - `Using fallback prediction`
   - `Chatbot API Error`

## 📞 Getting Help

If issues persist:
1. Check both backend and frontend are running
2. Verify all dependencies are installed
3. Check browser console for detailed errors
4. Ensure firewall isn't blocking ports 3000/8000

## 🔄 Reset Instructions

To completely reset the application:
```bash
# Clear frontend cache
rm -rf node_modules
npm install

# Reset backend
cd insulin_resistance_prediction-main
rm -rf venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## ✅ Verification

To verify everything is working:
1. Visit http://localhost:3000
2. Check backend health: http://localhost:8000
3. View API docs: http://localhost:8000/docs
4. Test a basic assessment
5. Try the chatbot
