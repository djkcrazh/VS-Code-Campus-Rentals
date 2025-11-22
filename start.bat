@echo off
REM Campus Rentals - Quick Start Script for Windows

echo 🎓 Campus Rentals - Quick Start
echo ================================

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.9 or higher.
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    exit /b 1
)

echo ✅ Python and Node.js detected

REM Setup backend
echo.
echo 📦 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing Python dependencies...
pip install -q -r requirements.txt

REM Initialize database if it doesn't exist
if not exist "campus_rentals.db" (
    echo Initializing database with sample data...
    python seed_data.py
)

REM Start backend
echo Starting backend server on http://localhost:8000...
start /B python main.py

cd ..

REM Setup frontend
echo.
echo 📦 Setting up frontend...
cd frontend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install
)

REM Start frontend
echo Starting frontend server on http://localhost:3000...
start /B npm run dev

cd ..

echo.
echo ================================
echo ✅ Campus Rentals is running!
echo ================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Demo credentials:
echo   Email: demo@princeton.edu
echo   Password: password123
echo.
echo Press Ctrl+C to stop
echo.

pause
