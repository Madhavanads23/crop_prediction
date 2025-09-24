@echo off
echo ============================================
echo  AgriSmart MySQL Setup - Interactive Mode
echo ============================================
echo.
echo Step 1: I'll open MySQL command line for you
echo Step 2: You enter your password when prompted
echo Step 3: I'll take over and set up everything
echo.
echo Press any key when ready...
pause > nul

echo.
echo Opening MySQL command line...
echo (Enter your password when prompted)
echo.

cd /d "C:\Program Files\MySQL\MySQL Server 8.0\bin"

echo mysql -u root -p
echo.
echo After you're logged in and see the "mysql>" prompt:
echo 1. Don't close this window
echo 2. Go back to VS Code
echo 3. Tell the AI "I'm logged in"
echo.

mysql -u root -p