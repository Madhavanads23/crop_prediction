@echo off
echo 🐍 Installing Python ML Dependencies for AgriSmart...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found, installing ML dependencies...
echo.

REM Navigate to Python ML directory
cd /d "%~dp0ml_python"

REM Install required packages
echo 📦 Installing NumPy, Pandas, Scikit-learn...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Python ML dependencies installed successfully!
    echo.
    echo 🤖 Training Random Forest models...
    python ml_predictor.py train
    
    if %ERRORLEVEL% equ 0 (
        echo.
        echo 🎉 AgriSmart Python ML System is ready!
        echo ✅ Random Forest models trained with 1200+ samples
        echo ✅ 37+ crops supported with advanced algorithms
        echo ✅ Models saved and ready for predictions
        echo.
        echo Your app now uses high-performance Python ML instead of JavaScript!
    ) else (
        echo ❌ Model training failed. Check Python installation.
    )
) else (
    echo ❌ Failed to install Python dependencies
    echo Please check your Python installation and internet connection
)

echo.
pause