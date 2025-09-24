const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('🚀 Starting AgriSmart MySQL Setup...');
  
  try {
    // Connect to MySQL as root (you'll need to provide the password)
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Mad123hava',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL as root');

    // Create database and user
    await connection.execute(`
      CREATE DATABASE IF NOT EXISTS agrismart_db;
      CREATE USER IF NOT EXISTS 'agrismart_user'@'localhost' IDENTIFIED BY 'agrismart_mysql_2025';
      GRANT ALL PRIVILEGES ON agrismart_db.* TO 'agrismart_user'@'localhost';
      FLUSH PRIVILEGES;
    `);

    console.log('✅ Database and user created');

    // Switch to the new database
    await connection.execute('USE agrismart_db');

    // Create tables
    await connection.execute(`
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

    await connection.execute(`
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

    await connection.execute(`
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

    console.log('✅ Tables created successfully');

    // Verify tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Created tables:', tables.map(t => Object.values(t)[0]));

    await connection.end();
    console.log('🎉 Database setup complete!');
    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

// Run setup
setupDatabase().then(success => {
  if (success) {
    console.log('\n🚀 Next step: Import training data with:');
    console.log('node scripts/import_training_data_mysql.cjs');
  }
}).catch(console.error);