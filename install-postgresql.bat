@echo off
echo Installing PostgreSQL for Insulin Tracker...
echo.

REM Check if Chocolatey is installed
where choco >nul 2>nul
if %errorlevel% equ 0 (
    echo Chocolatey found. Installing PostgreSQL via Chocolatey...
    choco install postgresql -y
    echo.
    echo PostgreSQL installation completed!
    echo Please restart your terminal and run: psql --version
    echo.
    echo Then create database with: psql -U postgres -c "CREATE DATABASE insulin_tracker;"
    echo.
    pause
    exit /b 0
)

REM If Chocolatey not found, provide manual instructions
echo Chocolatey not found. Please install PostgreSQL manually:
echo.
echo 1. Go to: https://www.postgresql.org/download/windows/
echo 2. Download the latest Windows installer
echo 3. Run installer as Administrator
echo 4. Set password for 'postgres' user (remember it!)
echo 5. Keep default port 5432
echo 6. Check "Add PostgreSQL to PATH"
echo.
echo After installation, restart terminal and test with:
echo   psql --version
echo.
echo Then create database:
echo   psql -U postgres -c "CREATE DATABASE insulin_tracker;"
echo.
pause
