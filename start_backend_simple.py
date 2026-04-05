#!/usr/bin/env python3
import subprocess
import sys
import os

print("🚀 Starting FastAPI Backend with AI Integration...")
print("📍 Directory:", os.getcwd())

try:
    # Start the backend server
    result = subprocess.run([
        sys.executable, "main.py"
    ], cwd=os.path.dirname(os.path.abspath(__file__)))
    
    if result.returncode == 0:
        print("✅ Backend started successfully!")
        print("🌐 Server should be available at: http://localhost:8000")
    else:
        print(f"❌ Backend failed with exit code: {result.returncode}")
        print(f"📝 Error output: {result.stderr}")
        
except Exception as e:
    print(f"❌ Failed to start backend: {e}")
