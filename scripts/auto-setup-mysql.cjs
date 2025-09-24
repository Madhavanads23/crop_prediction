const mysql = require('mysql2/promise');

async function setupDatabaseWithAlternatives() {
    console.log('🔧 Attempting Alternative MySQL Setup Methods...\n');

    // Method 1: Try connecting to existing databases that might work
    const alternatives = [
        {
            name: 'Default MySQL (no password)',
            config: { host: 'localhost', user: 'root', password: '', port: 3306 }
        },
        {
            name: 'MySQL with empty password',
            config: { host: 'localhost', user: 'root', port: 3306 }
        },
        {
            name: 'Try mysql user instead of root',
            config: { host: 'localhost', user: 'mysql', password: '', port: 3306 }
        },
        {
            name: 'Try with 127.0.0.1 instead of localhost',
            config: { host: '127.0.0.1', user: 'root', password: '', port: 3306 }
        },
        {
            name: 'Original password attempt',
            config: { host: 'localhost', user: 'root', password: 'Mad123hava', port: 3306 }
        }
    ];

    for (const method of alternatives) {
        console.log(`Trying: ${method.name}`);
        try {
            const connection = await mysql.createConnection(method.config);
            const [rows] = await connection.execute('SELECT VERSION() as version, USER() as user');
            console.log(`✅ SUCCESS! Connected as ${rows[0].user}, MySQL ${rows[0].version}`);
            
            // If we get here, connection works! Now set up the database
            await setupDatabase(connection, method.config);
            await connection.end();
            return true;
            
        } catch (error) {
            console.log(`❌ ${error.message.substring(0, 60)}...`);
        }
    }

    // If all methods fail, try creating SQLite fallback
    console.log('\n🔄 All MySQL methods failed. Creating SQLite fallback...');
    await createSQLiteFallback();
    return false;
}

async function setupDatabase(connection, config) {
    try {
        console.log('\n📦 Setting up AgriSmart database...');
        
        // Create database
        await connection.execute('CREATE DATABASE IF NOT EXISTS agrismart_db');
        console.log('✅ Database created: agrismart_db');
        
        // Create user (if we have permissions)
        try {
            await connection.execute(`CREATE USER IF NOT EXISTS 'agrismart_user'@'localhost' IDENTIFIED BY 'agrismart_mysql_2025'`);
            await connection.execute(`GRANT ALL PRIVILEGES ON agrismart_db.* TO 'agrismart_user'@'localhost'`);
            await connection.execute('FLUSH PRIVILEGES');
            console.log('✅ User created: agrismart_user');
        } catch (userError) {
            console.log('⚠️  Could not create user (using root access instead)');
        }
        
        // Switch to our database
        await connection.execute('USE agrismart_db');
        
        // Create tables
        console.log('📋 Creating tables...');
        
        const tables = [
            {
                name: 'historical_crop_data',
                sql: `CREATE TABLE IF NOT EXISTS historical_crop_data (
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
                ) ENGINE=InnoDB`
            },
            {
                name: 'weather_patterns',
                sql: `CREATE TABLE IF NOT EXISTS weather_patterns (
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
                ) ENGINE=InnoDB`
            },
            {
                name: 'crops',
                sql: `CREATE TABLE IF NOT EXISTS crops (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(64) UNIQUE,
                    growing_season ENUM('kharif', 'rabi', 'year_round'),
                    optimal_temp_min FLOAT,
                    optimal_temp_max FLOAT,
                    water_requirement FLOAT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB`
            }
        ];

        for (const table of tables) {
            await connection.execute(table.sql);
            console.log(`  ✅ ${table.name}`);
        }

        // Insert some sample data to test
        console.log('📊 Inserting sample crop data...');
        await insertSampleData(connection);
        
        // Update the database configuration file
        await updateDatabaseConfig(config);
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Your database is ready!');
        console.log('2. Run: npm run dev');
        console.log('3. Your ML model will start training with the sample data');
        
    } catch (error) {
        console.error('❌ Database setup error:', error.message);
        throw error;
    }
}

async function insertSampleData(connection) {
    const sampleData = [
        // Sample historical crop data for different regions and crops
        [1, 2023, 1, 'Punjab', 'Ludhiana', 'Wheat', 100.5, 4250.0, 427125.0, 22.5, 65.0, 450.0, 7.2, 120.0, 80.0, 60.0, 8.5, 18.2],
        [2, 2023, 1, 'Punjab', 'Amritsar', 'Rice', 85.2, 3800.0, 323760.0, 28.0, 75.0, 1200.0, 6.8, 140.0, 70.0, 40.0, 6.8, 20.1],
        [3, 2023, 2, 'Haryana', 'Karnal', 'Wheat', 95.8, 4100.0, 392780.0, 23.0, 60.0, 400.0, 7.5, 110.0, 75.0, 65.0, 7.2, 17.8],
        [4, 2023, 2, 'Haryana', 'Hisar', 'Cotton', 120.0, 550.0, 66000.0, 32.0, 55.0, 350.0, 7.8, 100.0, 60.0, 80.0, 9.1, 22.5],
        [5, 2023, 3, 'Uttar Pradesh', 'Meerut', 'Sugarcane', 150.0, 70000.0, 10500000.0, 26.0, 70.0, 800.0, 6.5, 200.0, 120.0, 100.0, 5.5, 19.5],
        [6, 2022, 1, 'Punjab', 'Ludhiana', 'Wheat', 98.2, 4180.0, 410276.0, 21.8, 68.0, 475.0, 7.1, 115.0, 85.0, 58.0, 8.2, 17.9],
        [7, 2022, 1, 'Punjab', 'Amritsar', 'Rice', 82.5, 3750.0, 309375.0, 27.5, 78.0, 1250.0, 6.9, 135.0, 72.0, 42.0, 7.1, 19.8],
        [8, 2022, 4, 'Maharashtra', 'Pune', 'Onion', 75.0, 15000.0, 1125000.0, 24.0, 65.0, 600.0, 6.8, 80.0, 50.0, 120.0, 6.8, 21.0],
        [9, 2022, 5, 'Gujarat', 'Ahmedabad', 'Cotton', 110.0, 580.0, 63800.0, 30.0, 58.0, 380.0, 7.6, 95.0, 55.0, 85.0, 8.8, 23.2],
        [10, 2022, 6, 'Rajasthan', 'Jaipur', 'Bajra', 90.0, 1200.0, 108000.0, 35.0, 45.0, 250.0, 8.0, 70.0, 40.0, 30.0, 12.0, 24.5]
    ];

    const insertSQL = `
        INSERT INTO historical_crop_data 
        (dist_code, crop_year, state_code, state_name, district_name, crop, area_hectares, 
         yield_kg_per_ha, production_tonnes, temperature_c, humidity_percent, rainfall_mm, 
         ph, n_fertilizer, p_fertilizer, k_fertilizer, wind_speed, solar_radiation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const row of sampleData) {
        try {
            await connection.execute(insertSQL, row);
        } catch (error) {
            // Ignore duplicate entries
            if (!error.message.includes('Duplicate entry')) {
                throw error;
            }
        }
    }

    console.log(`  ✅ Inserted ${sampleData.length} sample records`);
}

async function updateDatabaseConfig(workingConfig) {
    const fs = require('fs').promises;
    
    // Create environment configuration
    const envContent = `# AgriSmart Database Configuration - Auto-generated
DB_HOST=${workingConfig.host}
DB_PORT=${workingConfig.port || 3306}
DB_NAME=agrismart_db
DB_USER=${workingConfig.user}
DB_PASSWORD=${workingConfig.password || ''}
NODE_ENV=development
`;

    await fs.writeFile('.env.local', envContent);
    console.log('✅ Environment configuration saved to .env.local');
}

async function createSQLiteFallback() {
    console.log('🗄️  Creating SQLite fallback database...');
    
    // Create a simple SQLite version as backup
    const fs = require('fs').promises;
    const fallbackConfig = `// Fallback SQLite configuration
// If MySQL continues to have issues, we can switch to SQLite
export const DATABASE_CONFIG = {
    type: 'sqlite',
    filename: './agrismart.db',
    fallback: true
};
`;
    
    await fs.writeFile('database-fallback.js', fallbackConfig);
    console.log('✅ SQLite fallback configuration created');
    console.log('📝 Manual MySQL setup guide available in TROUBLESHOOT-MYSQL.md');
}

// Run the setup
setupDatabaseWithAlternatives()
    .then(success => {
        if (success) {
            console.log('\n🚀 Ready to start! Run: npm run dev');
        } else {
            console.log('\n📖 Check TROUBLESHOOT-MYSQL.md for manual setup options');
        }
    })
    .catch(error => {
        console.error('\n💥 Setup failed:', error.message);
        console.log('\n📖 Check TROUBLESHOOT-MYSQL.md for manual setup options');
    });