const mysql = require('mysql2/promise');

async function verifySetup() {
    console.log('🔍 Verifying MySQL setup...\n');
    
    try {
        // Try connecting with the new user we created
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'agrismart_user',
            password: 'agrismart_mysql_2025',
            database: 'agrismart_db',
            port: 3306
        });

        console.log('✅ Connected successfully with agrismart_user!');

        // Check if tables exist
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n📋 Tables found:');
        tables.forEach(table => {
            console.log(`  ✅ ${Object.values(table)[0]}`);
        });

        // Check sample data
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM historical_crop_data');
        console.log(`\n📊 Training data records: ${rows[0].count}`);

        if (rows[0].count > 0) {
            // Show sample of the data
            const [sample] = await connection.execute('SELECT state_name, district_name, crop, yield_kg_per_ha FROM historical_crop_data LIMIT 3');
            console.log('\n📈 Sample training data:');
            sample.forEach(row => {
                console.log(`  • ${row.state_name}, ${row.district_name}: ${row.crop} - ${row.yield_kg_per_ha} kg/ha`);
            });
        }

        await connection.end();

        // Create environment file
        const fs = require('fs').promises;
        const envContent = `# AgriSmart Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agrismart_db
DB_USER=agrismart_user
DB_PASSWORD=agrismart_mysql_2025
NODE_ENV=development
`;
        
        await fs.writeFile('.env.local', envContent);
        console.log('\n✅ Environment configuration saved');

        console.log('\n🎉 SUCCESS! Your database is ready!');
        console.log('\n🚀 Next steps:');
        console.log('1. Run: npm run dev');
        console.log('2. Open your app in the browser');
        console.log('3. Your ML model will start training with the data');

        return true;

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        
        if(error.message.includes('Access denied')) {
            console.log('\n💡 This usually means the database setup isn\'t complete yet.');
            console.log('Make sure you ran all the SQL commands from mysql-commands.sql');
        }
        
        return false;
    }
}

verifySetup();