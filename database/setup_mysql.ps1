# MySQL Database Setup for AgriSmart
# Run this script to create the MySQL database and user

# MySQL database setup script
Write-Host "🗄️ Setting up MySQL database for AgriSmart..."

# Database configuration
$dbName = "agrismart_db"
$dbUser = "agrismart_user"
$dbPassword = "agrismart_mysql_2025"

# Create database and user (you'll need to run these commands in MySQL)
Write-Host "Please run these commands in your MySQL command line:"
Write-Host ""
Write-Host "CREATE DATABASE IF NOT EXISTS agrismart_db;"
Write-Host "CREATE USER IF NOT EXISTS 'agrismart_user'@'localhost' IDENTIFIED BY 'agrismart_mysql_2025';"
Write-Host "GRANT ALL PRIVILEGES ON agrismart_db.* TO 'agrismart_user'@'localhost';"
Write-Host "FLUSH PRIVILEGES;"
Write-Host "USE agrismart_db;"
Write-Host ""

# Create tables
$createTablesSQL = @"
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
"@

Write-Host "Database Tables SQL:"
Write-Host $createTablesSQL

Write-Host ""
Write-Host "After creating the database, run the import script with:"
Write-Host "node scripts/import_training_data_mysql.js"