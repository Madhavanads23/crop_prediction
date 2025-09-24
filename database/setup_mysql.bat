@echo off
echo 🗄️ AgriSmart MySQL Database Setup
echo.
echo Adding MySQL to PATH...
set PATH=%PATH%;C:\Program Files\MySQL\MySQL Server 8.0\bin

echo.
echo Connecting to MySQL...
echo Please enter your MySQL root password when prompted.
echo.
echo After connecting, copy and paste these commands:
echo.
echo CREATE DATABASE IF NOT EXISTS agrismart_db;
echo CREATE USER IF NOT EXISTS 'agrismart_user'@'localhost' IDENTIFIED BY 'agrismart_mysql_2025';
echo GRANT ALL PRIVILEGES ON agrismart_db.* TO 'agrismart_user'@'localhost';
echo FLUSH PRIVILEGES;
echo USE agrismart_db;
echo.
echo Then run the table creation commands from database/setup_mysql.sql
echo.
pause
mysql -u root -p