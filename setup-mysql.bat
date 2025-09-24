@echo off
echo =================================
echo  AgriSmart MySQL Setup Helper
echo =================================
echo.

echo Checking MySQL installation...
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    echo ✓ MySQL found in Program Files
) else (
    echo ✗ MySQL not found in expected location
    echo Please check your MySQL installation
    pause
    exit /b 1
)

echo.
echo Attempting to connect to MySQL...
echo (You will be prompted for the root password)
echo.

cd /d "C:\Program Files\MySQL\MySQL Server 8.0\bin"

echo Running MySQL setup script...
mysql -u root -p < "%~dp0database\setup_mysql.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Database setup completed successfully!
    echo.
    echo Now running data import...
    cd /d "%~dp0"
    node scripts/import_training_data_mysql.cjs
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo 🎉 SUCCESS! MySQL setup and data import completed!
        echo Your AgriSmart database is ready to use.
    ) else (
        echo.
        echo ⚠️  Database created but data import failed.
        echo You can try running: npm run mysql:import
    )
) else (
    echo.
    echo ✗ Database setup failed. Please check your MySQL password.
    echo.
    echo Try manual setup using MYSQL-SETUP-MANUAL.md
)

echo.
pause