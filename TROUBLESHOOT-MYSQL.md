# 🔧 MySQL Authentication Issues - Troubleshooting Guide

## The Problem
Your MySQL installation is rejecting the root password "Mad123hava". This is common with MySQL 8.0.

## Solutions (Try in Order)

### Method 1: Use MySQL Workbench (Recommended)
1. **Open MySQL Workbench** (should be installed with MySQL)
2. **Create a new connection**:
   - Connection Name: `AgriSmart Local`
   - Hostname: `127.0.0.1`
   - Port: `3306`
   - Username: `root`
   - Password: `Mad123hava`
3. **Test Connection** - if it works, proceed to Method 4

### Method 2: Reset MySQL Root Password
If you can't connect, reset the password:

1. **Stop MySQL Service**:
   - Open `services.msc`
   - Find `MySQL80` service
   - Right-click → Stop

2. **Start MySQL in Safe Mode**:
   ```cmd
   cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
   mysqld --skip-grant-tables --skip-networking
   ```

3. **In another Command Prompt**:
   ```cmd
   cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
   mysql -u root
   ```

4. **Reset the password**:
   ```sql
   USE mysql;
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mad123hava';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **Restart MySQL Service normally**

### Method 3: Use MySQL Configuration Wizard
1. **Search for "MySQL Installer"** in Windows Start menu
2. **Run MySQL Installer**
3. **Click "Reconfigure"** next to MySQL Server
4. **Go through the configuration wizard**
5. **Set root password to**: `Mad123hava`

### Method 4: Manual Database Setup (Once Connected)
After establishing connection through Workbench or command line:

```sql
-- Create database and user
CREATE DATABASE IF NOT EXISTS agrismart_db;
CREATE USER IF NOT EXISTS 'agrismart_user'@'localhost' IDENTIFIED BY 'agrismart_mysql_2025';
GRANT ALL PRIVILEGES ON agrismart_db.* TO 'agrismart_user'@'localhost';
FLUSH PRIVILEGES;
USE agrismart_db;

-- Create tables (copy from MYSQL-SETUP-MANUAL.md)
```

### Method 5: Alternative - Use XAMPP
If MySQL continues to be problematic:

1. **Download XAMPP** from https://www.apachefriends.org/
2. **Install and start MySQL** through XAMPP
3. **Use phpMyAdmin** (http://localhost/phpmyadmin)
4. **Default user**: `root`, **password**: (empty)
5. **Create the database manually**

## Quick Test Commands
After fixing authentication, test with:
```cmd
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysql -u root -p
```

Then run:
```sql
SELECT VERSION();
SHOW DATABASES;
```

## Next Steps After Success
1. Run: `node scripts/test-mysql-connection.cjs`
2. If successful, run: `npm run mysql:import`
3. Start application: `npm run dev`

---
💡 **Tip**: MySQL Workbench is usually the easiest way to manage MySQL on Windows!