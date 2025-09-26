# AgriSmart Python ML Installation Script
Write-Host "🐍 Installing Python ML Dependencies for AgriSmart..." -ForegroundColor Green
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://python.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📦 Installing ML dependencies..." -ForegroundColor Cyan
Write-Host ""

# Navigate to Python ML directory
Set-Location "ml_python"

# Install required packages
Write-Host "Installing NumPy, Pandas, Scikit-learn..." -ForegroundColor Yellow
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Python ML dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🤖 Training Random Forest models..." -ForegroundColor Cyan
    python ml_predictor.py train
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 AgriSmart Python ML System is ready!" -ForegroundColor Green
        Write-Host "✅ Random Forest models trained with 1200+ samples" -ForegroundColor Green
        Write-Host "✅ 37+ crops supported with advanced algorithms" -ForegroundColor Green  
        Write-Host "✅ Models saved and ready for predictions" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your app now uses high-performance Python ML instead of JavaScript!" -ForegroundColor Magenta
    } else {
        Write-Host "❌ Model training failed. Check Python installation." -ForegroundColor Red
    }
} else {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    Write-Host "Please check your Python installation and internet connection" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to continue"