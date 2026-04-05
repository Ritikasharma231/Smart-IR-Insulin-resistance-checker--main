@echo off
echo Starting Insulin Tracker Application...
echo.

REM Check if backend directory exists
if not exist "insulin_resistance_prediction-main\main.py" (
    echo Error: Backend files not found. Please ensure you're in the project root directory.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed. Please install Python first.
    pause
    exit /b 1
)

echo Starting FastAPI Backend...
cd insulin_resistance_prediction-main

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate
pip install -r requirements.txt >nul 2>&1

REM Start backend in new window
start "FastAPI Backend" cmd /k "call venv\Scripts\activate && python main.py"

echo Waiting for backend to start...
timeout /t 8 /nobreak >nul

echo Starting React Frontend...
cd ..

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

REM Start frontend in new window
start "React Frontend" cmd /k "npm start"

echo.
echo ========================================
echo  Insulin Tracker Application Started!
echo ========================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo NOTE: Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo ========================================
echo.
echo Press any key to exit this launcher...
pause >nul
