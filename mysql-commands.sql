-- ============================================
-- AgriSmart Database Setup Commands
-- Copy and paste these commands one by one after logging into MySQL
-- ============================================

-- Step 1: Create database and user
CREATE DATABASE IF NOT EXISTS agrismart_db;
CREATE USER IF NOT EXISTS 'agrismart_user'@'localhost' IDENTIFIED BY 'agrismart_mysql_2025';
GRANT ALL PRIVILEGES ON agrismart_db.* TO 'agrismart_user'@'localhost';
FLUSH PRIVILEGES;

-- Step 2: Use the database
USE agrismart_db;

-- Step 3: Create historical crop data table
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

-- Step 4: Create weather patterns table
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

-- Step 5: Create crops table
CREATE TABLE IF NOT EXISTS crops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) UNIQUE,
  growing_season ENUM('kharif', 'rabi', 'year_round'),
  optimal_temp_min FLOAT,
  optimal_temp_max FLOAT,
  water_requirement FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Step 6: Insert sample training data
INSERT INTO historical_crop_data 
(dist_code, crop_year, state_code, state_name, district_name, crop, area_hectares, 
 yield_kg_per_ha, production_tonnes, temperature_c, humidity_percent, rainfall_mm, 
 ph, n_fertilizer, p_fertilizer, k_fertilizer, wind_speed, solar_radiation) 
VALUES 
(1, 2023, 1, 'Punjab', 'Ludhiana', 'Wheat', 100.5, 4250.0, 427125.0, 22.5, 65.0, 450.0, 7.2, 120.0, 80.0, 60.0, 8.5, 18.2),
(2, 2023, 1, 'Punjab', 'Amritsar', 'Rice', 85.2, 3800.0, 323760.0, 28.0, 75.0, 1200.0, 6.8, 140.0, 70.0, 40.0, 6.8, 20.1),
(3, 2023, 2, 'Haryana', 'Karnal', 'Wheat', 95.8, 4100.0, 392780.0, 23.0, 60.0, 400.0, 7.5, 110.0, 75.0, 65.0, 7.2, 17.8),
(4, 2023, 2, 'Haryana', 'Hisar', 'Cotton', 120.0, 550.0, 66000.0, 32.0, 55.0, 350.0, 7.8, 100.0, 60.0, 80.0, 9.1, 22.5),
(5, 2023, 3, 'Uttar Pradesh', 'Meerut', 'Sugarcane', 150.0, 70000.0, 10500000.0, 26.0, 70.0, 800.0, 6.5, 200.0, 120.0, 100.0, 5.5, 19.5),
(6, 2022, 1, 'Punjab', 'Ludhiana', 'Wheat', 98.2, 4180.0, 410276.0, 21.8, 68.0, 475.0, 7.1, 115.0, 85.0, 58.0, 8.2, 17.9),
(7, 2022, 1, 'Punjab', 'Amritsar', 'Rice', 82.5, 3750.0, 309375.0, 27.5, 78.0, 1250.0, 6.9, 135.0, 72.0, 42.0, 7.1, 19.8),
(8, 2022, 4, 'Maharashtra', 'Pune', 'Onion', 75.0, 15000.0, 1125000.0, 24.0, 65.0, 600.0, 6.8, 80.0, 50.0, 120.0, 6.8, 21.0),
(9, 2022, 5, 'Gujarat', 'Ahmedabad', 'Cotton', 110.0, 580.0, 63800.0, 30.0, 58.0, 380.0, 7.6, 95.0, 55.0, 85.0, 8.8, 23.2),
(10, 2022, 6, 'Rajasthan', 'Jaipur', 'Bajra', 90.0, 1200.0, 108000.0, 35.0, 45.0, 250.0, 8.0, 70.0, 40.0, 30.0, 12.0, 24.5);

-- Step 7: Verify everything is working
SELECT COUNT(*) as total_records FROM historical_crop_data;
SHOW TABLES;

-- Step 8: Exit MySQL (type 'exit' when done)
-- exit;