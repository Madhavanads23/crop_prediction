# 🚀 Manual MySQL Setup for AgriSmart

## Step 1: Open MySQL Workbench or Command Line

If you have **MySQL Workbench** installed, open it and connect as root.

Or use **Command Prompt** (as Administrator):
```cmd
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysql -u root -p
```

## Step 2: Run These SQL Commands

Copy and paste these commands one by one:

### Create Database and User:
```sql
CREATE DATABASE IF NOT EXISTS agrismart_db;
CREATE USER IF NOT EXISTS 'agrismart_user'@'localhost' IDENTIFIED BY 'agrismart_mysql_2025';
GRANT ALL PRIVILEGES ON agrismart_db.* TO 'agrismart_user'@'localhost';
FLUSH PRIVILEGES;
USE agrismart_db;
```

### Create Tables:
```sql
CREATE TABLE IF NOT EXISTS historical_crop_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dist_code INT,
  crop_year INT,
  state_code INT,
  state_name VARCHAR(64),
  district_name VARCHAR(64),
  crop VARCHAR(64),
  area_hectares FLOAT,
  yield_kg_per_ha FLOAT,
  production_tonnes FLOAT,
  temperature_c FLOAT,
  humidity_percent FLOAT,
  rainfall_mm FLOAT,
  ph FLOAT,
  n_fertilizer FLOAT,
  p_fertilizer FLOAT,
  k_fertilizer FLOAT,
  wind_speed FLOAT,
  solar_radiation FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_state_district (state_name, district_name),
  INDEX idx_crop_year (crop, crop_year),
  INDEX idx_yield (yield_kg_per_ha)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS weather_patterns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  state_name VARCHAR(64),
  district_name VARCHAR(64),
  month INT,
  avg_temperature_c FLOAT,
  avg_humidity_percent FLOAT,
  avg_rainfall_mm FLOAT,
  avg_wind_speed FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_location_month (state_name, district_name, month)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS crops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) UNIQUE,
  growing_season ENUM('kharif', 'rabi', 'year_round'),
  optimal_temp_min FLOAT,
  optimal_temp_max FLOAT,
  water_requirement FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

### Verify Tables:
```sql
SHOW TABLES;
```

## Step 3: Exit MySQL and Import Data

After completing the above:
1. Exit MySQL: `EXIT;`
2. Run the import script: `npm run mysql:import`

## Alternative: Use phpMyAdmin

If you have **XAMPP** or **phpMyAdmin**:
1. Open phpMyAdmin in browser
2. Create new database: `agrismart_db`
3. Run the SQL commands above in the SQL tab