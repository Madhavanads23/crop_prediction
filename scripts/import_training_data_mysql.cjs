// Data Import Script for Training the Random Forest Model (MySQL)
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Update these credentials as needed
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Mad123hava',
  database: 'agrismart_db',
  multipleStatements: true
};

async function importHistoricalCropData() {
  console.log('🌾 Starting AgriSmart MySQL Setup & Data Import...');
  const connection = await mysql.createConnection({...dbConfig, database: undefined});
  
  try {
    // Create database and user
    console.log('🏗️ Creating database and user...');
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS agrismart_db;
      CREATE USER IF NOT EXISTS 'agrismart_user'@'localhost' IDENTIFIED BY 'agrismart_mysql_2025';
      GRANT ALL PRIVILEGES ON agrismart_db.* TO 'agrismart_user'@'localhost';
      FLUSH PRIVILEGES;
      USE agrismart_db;
    `);
    
    console.log('✅ Database setup complete');
    
    // Create table if not exists
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
        solar_radiation FLOAT
      ) ENGINE=InnoDB;
    `);
    // Clear existing data
    await connection.query('TRUNCATE TABLE historical_crop_data');
    const csvPath = path.join(__dirname, '../data/Custom_Crops_yield_Historical_Dataset (1).csv');
    if (!fs.existsSync(csvPath)) throw new Error(`CSV file not found: ${csvPath}`);
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    let recordCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',');
      const row = {};
      headers.forEach((header, idx) => {
        row[header.trim()] = values[idx] ? values[idx].trim() : null;
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
      if (record[6] && record[7]) record[8] = (record[6] * record[7]) / 1000;
      await connection.query(
        `INSERT INTO historical_crop_data (
          dist_code, crop_year, state_code, state_name, district_name, crop,
          area_hectares, yield_kg_per_ha, production_tonnes, temperature_c,
          humidity_percent, rainfall_mm, ph, n_fertilizer, p_fertilizer, k_fertilizer,
          wind_speed, solar_radiation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        record
      );
      recordCount++;
      if (recordCount % 1000 === 0) console.log(`✅ Imported ${recordCount} records...`);
    }
    console.log(`🎉 Import complete! Total records imported: ${recordCount}`);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  importHistoricalCropData().catch(err => {
    console.error('❌ Import failed:', err);
    process.exit(1);
  });
}
