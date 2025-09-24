const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('🔍 Testing MySQL Connection...\n');
    
    const configurations = [
        {
            name: 'Root with your password',
            config: {
                host: 'localhost',
                user: 'root',
                password: 'Mad123hava',
                port: 3306
            }
        },
        {
            name: 'Root without password',
            config: {
                host: 'localhost',
                user: 'root',
                password: '',
                port: 3306
            }
        },
        {
            name: 'Root with empty string',
            config: {
                host: 'localhost',
                user: 'root',
                port: 3306
            }
        }
    ];

    for (const test of configurations) {
        console.log(`Testing: ${test.name}`);
        try {
            const connection = await mysql.createConnection(test.config);
            const [rows] = await connection.execute('SELECT VERSION() as version');
            console.log(`✅ SUCCESS! MySQL Version: ${rows[0].version}`);
            
            // Test database creation
            await connection.execute('CREATE DATABASE IF NOT EXISTS test_agrismart');
            console.log('✅ Database creation test passed');
            
            await connection.execute('DROP DATABASE IF EXISTS test_agrismart');
            console.log('✅ Database deletion test passed');
            
            await connection.end();
            console.log(`\n🎉 Connection "${test.name}" works!\n`);
            
            // Now run the full setup
            console.log('Running full database setup...');
            await runFullSetup(test.config);
            return;
            
        } catch (error) {
            console.log(`❌ Failed: ${error.message}\n`);
        }
    }
    
    console.log('❌ All connection attempts failed. Please check:');
    console.log('1. MySQL service is running');
    console.log('2. Root password is correct');
    console.log('3. MySQL is accessible on localhost:3306');
}

async function runFullSetup(config) {
    try {
        const connection = await mysql.createConnection(config);
        
        console.log('Creating database and user...');
        await connection.execute('CREATE DATABASE IF NOT EXISTS agrismart_db');
        await connection.execute(`CREATE USER IF NOT EXISTS 'agrismart_user'@'localhost' IDENTIFIED BY 'agrismart_mysql_2025'`);
        await connection.execute(`GRANT ALL PRIVILEGES ON agrismart_db.* TO 'agrismart_user'@'localhost'`);
        await connection.execute('FLUSH PRIVILEGES');
        
        await connection.execute('USE agrismart_db');
        
        console.log('Creating tables...');
        
        // Create historical_crop_data table
        const createTableSQL = `
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
        ) ENGINE=InnoDB
        `;
        
        await connection.execute(createTableSQL);
        
        // Create other tables
        const weatherTableSQL = `
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
        ) ENGINE=InnoDB
        `;
        
        await connection.execute(weatherTableSQL);
        
        const cropsTableSQL = `
        CREATE TABLE IF NOT EXISTS crops (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(64) UNIQUE,
          growing_season ENUM('kharif', 'rabi', 'year_round'),
          optimal_temp_min FLOAT,
          optimal_temp_max FLOAT,
          water_requirement FLOAT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
        `;
        
        await connection.execute(cropsTableSQL);
        
        console.log('✅ All tables created successfully!');
        
        // Verify tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n📋 Created tables:');
        tables.forEach(table => console.log(`  - ${Object.values(table)[0]}`));
        
        await connection.end();
        
        console.log('\n🎉 MySQL setup completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Run: npm run mysql:import');
        console.log('2. Start your application: npm run dev');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    }
}

testConnection().catch(console.error);