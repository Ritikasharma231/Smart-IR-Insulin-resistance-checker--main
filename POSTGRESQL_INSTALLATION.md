# PostgreSQL Installation Guide for Windows

## 🪟 PostgreSQL Not Found

The error indicates that `psql` command is not recognized, which means PostgreSQL is either:
1. Not installed on your system
2. Not added to system PATH

## 🚀 Installation Options

### Option 1: Download Official Installer (Recommended)

1. **Download PostgreSQL**:
   - Go to: https://www.postgresql.org/download/windows/
   - Download the latest version (PostgreSQL 16+ recommended)
   - Choose the Windows x86-64 installer

2. **Run Installer**:
   - Right-click installer and "Run as administrator"
   - Choose installation directory (default: `C:\Program Files\PostgreSQL\16`)
   - Set password for `postgres` superuser (remember this!)
   - Select components: PostgreSQL Server, pgAdmin 4, Stack Builder
   - Keep port 5432 (default)

3. **Complete Installation**:
   - Finish the installation wizard
   - Ensure "Install Stack Builder at later" is checked

### Option 2: Use Chocolatey (Package Manager)

```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072 -bor 3072 -bor 192 -bor 168 -bor 128 -bor 256 -bor 64 -bor 32; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install PostgreSQL
choco install postgresql

# Install pgAdmin (optional)
choco install pgadmin4
```

### Option 3: Use WSL (Windows Subsystem for Linux)

```bash
# Install WSL if not already installed
wsl --install

# Install PostgreSQL in WSL
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql
```

## 🔧 Post-Installation Setup

### 1. Add PostgreSQL to PATH

**Method A: During Installation**
- ✅ Check "Add PostgreSQL to PATH" during installation

**Method B: Manual PATH Addition**
```powershell
# Add to system PATH (run as Administrator)
[Environment]::SetEnvironmentVariable("PATH", [Environment]::GetEnvironmentVariable("PATH", "Machine") + ";C:\Program Files\PostgreSQL\16\bin", "Machine")

# OR add to user PATH
[Environment]::SetEnvironmentVariable("PATH", [Environment]::GetEnvironmentVariable("PATH", "User") + ";C:\Program Files\PostgreSQL\16\bin", "User")
```

### 2. Initialize Database

```powershell
# Open Command Prompt as Administrator
cd "C:\Program Files\PostgreSQL\16\bin"

# Test installation
.\psql.exe -U postgres

# Create database
CREATE DATABASE insulin_tracker;

# Create user (optional)
CREATE USER insulin_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE insulin_tracker TO insulin_user;

# Exit
\q
```

### 3. Verify Installation

```powershell
# Check PostgreSQL version
psql --version

# Test connection
psql -h localhost -U postgres -d postgres

# List databases
psql -U postgres -l
```

## 🗄️ Database Setup Commands

Once PostgreSQL is installed, run these commands:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create the database
CREATE DATABASE insulin_tracker;

-- Connect to your new database
\c insulin_tracker

-- Verify database creation
\l  -- list databases
\dt  -- list tables
```

## 🚀 Quick Start Script

Create a `setup.bat` file:

```batch
@echo off
echo Setting up PostgreSQL for Insulin Tracker...

REM Try to find PostgreSQL installation
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\16\bin"
) else if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\15\bin"
) else if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\14\bin"
) else (
    echo PostgreSQL not found in standard locations.
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    pause
    exit /b
)

echo Found PostgreSQL at: %PSQL_PATH%

REM Add to PATH for current session
set PATH=%PATH%;%PSQL_PATH%

REM Test connection
echo Testing PostgreSQL connection...
%PSQL_PATH%\psql.exe -U postgres -c "SELECT version();"

if %errorlevel% equ 0 (
    echo PostgreSQL connection successful!
    echo.
    echo Creating database...
    %PSQL_PATH%\psql.exe -U postgres -c "CREATE DATABASE insulin_tracker;"
    echo Database 'insulin_tracker' created successfully!
    echo.
    echo Now run: cd backend && npm run init-db
) else (
    echo PostgreSQL connection failed.
    echo Please check if PostgreSQL service is running.
)

pause
```

## 🔍 Troubleshooting

### Common Issues & Solutions

**"psql is not recognized"**:
1. PostgreSQL not installed → Download from postgresql.org
2. Not in PATH → Add PostgreSQL\bin to system PATH
3. Wrong directory → Find correct PostgreSQL installation path

**"Connection refused"**:
1. PostgreSQL service not running → Start PostgreSQL service
2. Wrong port → Check if PostgreSQL runs on 5432
3. Firewall blocking → Allow PostgreSQL through Windows Firewall

**"Authentication failed"**:
1. Wrong password → Use password set during installation
2. Wrong user → Try 'postgres' or created user
3. No password → Leave password blank if none set

### Service Management

```powershell
# Start PostgreSQL service
net start postgresql-x64-16

# Stop PostgreSQL service  
net stop postgresql-x64-16

# Check service status
sc query postgresql-x64-16
```

## 📱 GUI Tools

### pgAdmin Installation
1. Download from: https://www.pgadmin.org/download/pgadmin-4-windows.php
2. Install pgAdmin 4
3. Launch pgAdmin
4. Add new server connection:
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: [your installation password]

### Alternative GUIs
- **DBeaver**: Free universal database tool
- **DataGrip**: JetBrains IDE (paid)
- **HeidiSQL**: Free Windows SQL client
- **SQL Server Management Studio**: With PostgreSQL extension

## 🎯 Next Steps After Installation

1. **Install PostgreSQL** using one of the methods above
2. **Verify Installation** by running `psql --version`
3. **Create Database** using the setup script or manually
4. **Run Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run init-db
   npm run seed-db
   node server-postgres.js
   ```

## 📞 Installation Help

If you encounter issues:
1. **Official Documentation**: https://www.postgresql.org/docs/
2. **Stack Overflow**: Search for "PostgreSQL Windows installation"
3. **Community Forums**: PostgreSQL community forums
4. **Video Tutorials**: YouTube PostgreSQL installation guides

---

## 🚀 Quick Test

Once installed, test with:
```powershell
psql -U postgres -c "SELECT 'PostgreSQL is working!' as status;"
```

Expected output:
```
        status        
--------------------
 PostgreSQL is working!
(1 row)
```

Choose the installation method that works best for your system and follow the steps carefully!
