const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // Will prompt for password
  multipleStatements: true
};

async function setupDatabase() {
  console.log('🗄️ Setting up AgriSmart MySQL Database...');
  
  // Get password from user
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const password = await new Promise((resolve) => {
    rl.question('Enter MySQL root password: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
  
  dbConfig.password = password;
  
  try {
    // Connect to MySQL
    console.log('🔌 Connecting to MySQL...');
    const connection = await mysql.createConnection(dbConfig);
    
    // Create database and user
    console.log('🏗️ Creating database and user...');
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS agrismart_db;
      CREATE USER IF NOT EXISTS 'agrismart_user'@'localhost' IDENTIFIED BY 'agrismart_mysql_2025';
      GRANT ALL PRIVILEGES ON agrismart_db.* TO 'agrismart_user'@'localhost';
      FLUSH PRIVILEGES;
    `);
    
    // Switch to the new database
    await connection.query('USE agrismart_db');
    
    // Create tables
    console.log('📋 Creating tables...');
    await connection.query(`
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
    `);
    
    await connection.query(`
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
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS crops (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(64) UNIQUE,
        growing_season ENUM('kharif', 'rabi', 'year_round'),
        optimal_temp_min FLOAT,
        optimal_temp_max FLOAT,
        water_requirement FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    
    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('✅ Tables created:', tables.map(t => Object.values(t)[0]));
    
    await connection.end();
    console.log('🎉 Database setup completed successfully!');
    
    // Now import data
    await importData();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

async function importData() {
  console.log('📊 Starting data import...');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'agrismart_user',
    password: 'agrismart_mysql_2025',
    database: 'agrismart_db',
    multipleStatements: true
  });
  
  try {
    // Clear existing data
    await connection.query('TRUNCATE TABLE historical_crop_data');
    
    const csvPath = path.join(__dirname, '../data/Custom_Crops_yield_Historical_Dataset (1).csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }
    
    console.log('📁 Reading CSV file...');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('📋 CSV Headers:', headers.slice(0, 5), '...');
    
    let recordCount = 0;
    const batchSize = 1000;
    let batch = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        const values = line.split(',');
        const row = {};
        
        headers.forEach((header, idx) => {
          row[header] = values[idx] ? values[idx].trim() : null;
        });
        
        if (!row['Year'] || !row['State Name'] || !row['Crop']) continue;
        
        const record = [
          parseInt(row['Dist Code']) || null,
          parseInt(row['Year']) || null,
          parseInt(row['State Code']) || null,
          row['State Name'] || null,
          row['Dist Name'] || null,
          row['Crop'] ? row['Crop'].toLowerCase() : null,
          parseFloat(row['Area_ha']) || null,
          parseFloat(row['Yield_kg_per_ha']) || null,
          null, // production_tonnes, calculated below
          parseFloat(row['Temperature_C']) || null,
          parseFloat(row['Humidity_%']) || null,
          parseFloat(row['Rainfall_mm']) || null,
          parseFloat(row['pH']) || null,
          parseFloat(row['N_req_kg_per_ha']) || null,
          parseFloat(row['P_req_kg_per_ha']) || null,
          parseFloat(row['K_req_kg_per_ha']) || null,
          parseFloat(row['Wind_Speed_m_s']) || null,
          parseFloat(row['Solar_Radiation_MJ_m2_day']) || null
        ];
        
        // Calculate production_tonnes
        if (record[6] && record[7]) {
          record[8] = (record[6] * record[7]) / 1000;
        }
        
        batch.push(record);
        
        if (batch.length >= batchSize) {
          await processBatch(connection, batch);
          recordCount += batch.length;
          console.log(`✅ Imported ${recordCount} records...`);
          batch = [];
        }
        
      } catch (error) {
        console.error('Error processing row:', error.message);
      }
    }
    
    // Process remaining records
    if (batch.length > 0) {
      await processBatch(connection, batch);
      recordCount += batch.length;
    }
    
    console.log(`🎉 Data import complete! Total records: ${recordCount}`);
    
    // Verify import
    const [result] = await connection.query('SELECT COUNT(*) as count FROM historical_crop_data');
    console.log(`📊 Records in database: ${result[0].count}`);
    
    await connection.end();
    console.log('✅ AgriSmart database is ready for ML training!');
    
  } catch (error) {
    console.error('❌ Data import failed:', error.message);
    await connection.end();
    process.exit(1);
  }
}

async function processBatch(connection, batch) {
  const insertQuery = `
    INSERT INTO historical_crop_data (
      dist_code, crop_year, state_code, state_name, district_name, crop,
      area_hectares, yield_kg_per_ha, production_tonnes, temperature_c,
      humidity_percent, rainfall_mm, ph, n_fertilizer, p_fertilizer, k_fertilizer,
      wind_speed, solar_radiation
    ) VALUES ?
  `;
  
  await connection.query(insertQuery, [batch]);
}

// Run setup
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };