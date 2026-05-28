# Start ML API locally and expose via ngrok (if ngrok.exe exists at repo root)
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Backend = Join-Path $Root "insulin_resistance_prediction-main"

Set-Location $Backend

if (-not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

Write-Host "Installing dependencies..."
.\venv\Scripts\python.exe -m pip install -q -r requirements.txt

if (-not (Test-Path ".\model\basic_model.pkl")) {
    Write-Error "Model files missing in insulin_resistance_prediction-main\model"
}

$env:HOST = "0.0.0.0"
$env:PORT = "8000"
if (Test-Path ".\.env") {
    Get-Content ".\.env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim()
        }
    }
}

Write-Host "Starting FastAPI on http://127.0.0.1:8000 ..."
Start-Process -FilePath ".\venv\Scripts\python.exe" -ArgumentList "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" -WorkingDirectory $Backend -WindowStyle Minimized

Start-Sleep -Seconds 15
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 15
    Write-Host "Health:" ($health | ConvertTo-Json -Compress)
} catch {
    Write-Warning "Health check failed: $_"
}

$ngrok = Join-Path $Root "ngrok.exe"
if (Test-Path $ngrok) {
    Write-Host "Starting ngrok tunnel to port 8000..."
    Start-Process -FilePath $ngrok -ArgumentList "http", "8000" -WorkingDirectory $Root
    Write-Host "Open http://127.0.0.1:4040 for the public HTTPS URL. Set REACT_APP_API_URL to that URL."
} else {
    Write-Host "Local API: http://127.0.0.1:8000 (no ngrok.exe found)"
}
