#!/usr/bin/env python3
print("🔍 Simple Backend Test")
print("=" * 50)

try:
    print("📦 Testing imports...")
    import fastapi
    print("✅ FastAPI: OK")
    
    import uvicorn
    print("✅ Uvicorn: OK")
    
    from main import app
    print("✅ Main app: OK")
    
    print("🚀 Starting minimal server...")
    uvicorn.run(app, host="127.0.0.1", port=8003, log_level="info")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
