# 🔍 AI INTEGRATION DEBUG SCRIPT - PowerShell Version
# Comprehensive debugging for AI model, backend, and frontend integration

Write-Host "=== AI INTEGRATION DEBUG ===" -ForegroundColor Green

# Function to test if a port is available
function Test-Port {
    param($Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("localhost", $Port, 5000)
        $tcpClient.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if process is running
function Test-Process {
    param($ProcessName)
    $process = Get-Process $ProcessName -ErrorAction SilentlyContinue
    return $null -ne $process
}

# Function to test HTTP endpoint
function Test-HttpEndpoint {
    param($Url, $Method = "GET", $Body = $null)
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $Body -TimeoutSec 10
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -TimeoutSec 10
        }
        
        return @{
            Success = $true
            Response = $response
            StatusCode = $response.StatusCode
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_
            StatusCode = 0
        }
    }
}

Write-Host "Step 1: Checking Python Dependencies..." -ForegroundColor Yellow

# Test critical Python packages
$criticalPackages = @("uvicorn", "fastapi", "joblib", "numpy", "shap", "groq", "faiss-cpu", "sentence-transformers", "langchain", "pydantic", "python-dotenv")
$missingPackages = @()

foreach ($package in $criticalPackages) {
    try {
        $null = [System.Reflection.Assembly]::LoadWithPartialName($package).GetName()
        if ($null -ne $null) {
            Write-Host "✅ $package : Available" -ForegroundColor Green
        } else {
            $missingPackages += $package
            Write-Host "❌ $package : MISSING" -ForegroundColor Red
        }
    }
    catch {
        $missingPackages += $package
        Write-Host "❌ $package : ERROR - $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host ""
    Write-Host "MISSING PACKAGES:" -ForegroundColor Red
    foreach ($pkg in $missingPackages) {
        Write-Host "  - $pkg" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Install missing packages with:" -ForegroundColor Yellow
    Write-Host "pip install uvicorn fastapi joblib numpy shap groq faiss-cpu sentence-transformers langchain pydantic python-dotenv" -ForegroundColor Green
    Write-Host ""
    return
}

Write-Host "Step 2: Checking Model Files..." -ForegroundColor Yellow

# Check if model files exist
$modelPath = "model"
$modelFiles = @("basic_model.pkl", "intermediate_model.pkl", "advanced_model.pkl")
$missingModels = @()

foreach ($file in $modelFiles) {
    $fullPath = Join-Path $modelPath $file
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Host "✅ $file : EXISTS ($size bytes)" -ForegroundColor Green
    } else {
        $missingModels += $file
        Write-Host "❌ $file : MISSING" -ForegroundColor Red
    }
}

if ($missingModels.Count -gt 0) {
    Write-Host ""
    Write-Host "MISSING MODEL FILES:" -ForegroundColor Red
    foreach ($model in $missingModels) {
        Write-Host "  - $model" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Ensure model files are in the 'model' directory" -ForegroundColor Yellow
    return
}

Write-Host "Step 3: Checking Environment Variables..." -ForegroundColor Yellow

# Test environment variables
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    
    # Read and check critical variables
    $envContent = Get-Content $envFile
    $groqKeySet = $false
    $hfTokenSet = $false
    
    foreach ($line in $envContent) {
        if ($line -match "GROQ_API_KEY=") {
            $groqKeySet = $true
        }
        if ($line -match "HF_TOKEN=") {
            $hfTokenSet = $true
        }
    }
    
    if ($groqKeySet) {
        Write-Host "✅ GROQ_API_KEY: SET" -ForegroundColor Green
    } else {
        Write-Host "❌ GROQ_API_KEY: NOT SET" -ForegroundColor Red
    }
    
    if ($hfTokenSet) {
        Write-Host "✅ HF_TOKEN: SET" -ForegroundColor Green
    } else {
        Write-Host "⚠️  HF_TOKEN: NOT SET (Optional)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file: MISSING" -ForegroundColor Red
    Write-Host "Create .env file with:" -ForegroundColor Yellow
    Write-Host "GROQ_API_KEY=your_groq_api_key_here" -ForegroundColor Green
    return
}

Write-Host "Step 4: Checking Port Availability..." -ForegroundColor Yellow

# Check which ports are available
$ports = @(8000, 8001, 8002)
$availablePorts = @()

foreach ($port in $ports) {
    if (Test-Port $port) {
        $availablePorts += $port
        Write-Host "✅ Port $port : Available" -ForegroundColor Green
    } else {
        Write-Host "❌ Port $port : In Use" -ForegroundColor Red
    }
}

if ($availablePorts.Count -eq 0) {
    Write-Host "❌ NO PORTS AVAILABLE FOR BACKEND" -ForegroundColor Red
    Write-Host "Kill processes using ports 8000-8002:" -ForegroundColor Yellow
    Write-Host "Get-Process | Where-Object {$_.ProcessName -like '*python*'} | Stop-Process" -ForegroundColor Green
    return
}

Write-Host "Step 5: Testing Backend Startup..." -ForegroundColor Yellow

# Try to start the backend with detailed logging
$backendDir = "insulin_resistance_prediction-main"
Set-Location $backendDir

Write-Host "Attempting to start backend server..." -ForegroundColor Green
Write-Host "Directory: $(Get-Location)" -ForegroundColor Cyan

# Test if we can start the backend with a simple command
try {
    Write-Host "Testing Python syntax..." -ForegroundColor Yellow
    $testResult = python -c "print('Python syntax test')" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python syntax: OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Python syntax ERROR:" -ForegroundColor Red
        Write-Host $testResult -ForegroundColor Red
        return
    }
    
    Write-Host "Testing basic imports..." -ForegroundColor Yellow
    $importTest = python -c "
try:
    import joblib
    print('SUCCESS: joblib')
except:
    print('FAILED: joblib')
" 2>&1
    
    if ($importTest -match "SUCCESS: joblib") {
        Write-Host "✅ Basic imports: OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Import test failed:" -ForegroundColor Red
        Write-Host $importTest -ForegroundColor Red
        return
    }
    
    Write-Host "Starting backend server..." -ForegroundColor Green
    
    # Start the backend server
    $job = Start-Job -ScriptBlock {
        ScriptBlock = {
            Set-Location $backendDir
            try {
                python main.py
            }
            catch {
                Write-Host "❌ Backend startup failed: $($_)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Check if the process is still running
    $pythonProcess = Get-Process | Where-Object {$_.ProcessName -like "*python*"} -ErrorAction SilentlyContinue
    
    if ($pythonProcess) {
        Write-Host "✅ Backend process is running (PID: $($pythonProcess.Id))" -ForegroundColor Green
        
        # Test if the server is responding
        Write-Host "Testing server response..." -ForegroundColor Yellow
        $serverTest = Test-HttpEndpoint "http://localhost:8001/"
        
        if ($serverTest.Success) {
            Write-Host "✅ Server is responding!" -ForegroundColor Green
            Write-Host "Status Code: $($serverTest.StatusCode)" -ForegroundColor Green
            
            # Test prediction endpoint
            Write-Host "Testing prediction endpoint..." -ForegroundColor Yellow
            $testBody = '{"model_type": "basic", "Age": 35, "Sex": 1, "BMI": 28.5, "Waist": 95}'
            $predictTest = Test-HttpEndpoint "http://localhost:8001/predict" "POST" $testBody
            
            if ($predictTest.Success) {
                Write-Host "✅ Prediction endpoint working!" -ForegroundColor Green
                Write-Host "Response: $($predictTest.Response | ConvertTo-Json -Compress)" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Prediction endpoint failed:" -ForegroundColor Red
                Write-Host "Error: $($predictTest.Error)" -ForegroundColor Red
            }
            
            # Test chatbot endpoint
            Write-Host "Testing chatbot endpoint..." -ForegroundColor Yellow
            $chatBody = '{"message": "What is insulin resistance?", "user_context": {}}'
            $chatTest = Test-HttpEndpoint "http://localhost:8001/chat" "POST" $chatBody
            
            if ($chatTest.Success) {
                Write-Host "✅ Chatbot endpoint working!" -ForegroundColor Green
                Write-Host "Response: $($chatTest.Response | ConvertTo-Json -Compress)" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Chatbot endpoint failed:" -ForegroundColor Red
                Write-Host "Error: $($chatTest.Error)" -ForegroundColor Red
            }
            
        } else {
            Write-Host "❌ Backend process stopped responding" -ForegroundColor Red
        }
        
        # Wait a bit more and check again
        Start-Sleep -Seconds 3
        $pythonProcess = Get-Process | Where-Object {$_.ProcessName -like "*python*"} -ErrorAction SilentlyContinue
        
        if (-not $pythonProcess) {
            Write-Host "❌ Backend process has stopped" -ForegroundColor Red
            return
        }
        
        Write-Host "✅ Backend appears to be running successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "=== AI INTEGRATION TEST COMPLETE ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "1. Test frontend integration: http://localhost:3000" -ForegroundColor Green
        Write-Host "2. Check browser console for API calls" -ForegroundColor Green
        Write-Host "3. Update frontend API config if needed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Debug script failed: $($_)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Critical error during debugging: $($_)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== DEBUGGING COMPLETE ===" -ForegroundColor Green
