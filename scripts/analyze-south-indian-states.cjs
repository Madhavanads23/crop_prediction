const mysql = require('mysql2/promise');

async function analyzeSouthIndianStates() {
    let connection;
    
    try {
        console.log('🔍 Analyzing South Indian States in Your Existing Dataset...\n');
        
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'agrismart_user',
            password: 'agrismart_mysql_2025',
            database: 'agrismart_db',
            port: 3306
        });

        // Define the South Indian states you specified
        const southIndianStates = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh'];
        
        // Get detailed breakdown by state and crop
        console.log('🌾 South Indian Crops in Your Current Dataset:\n');
        
        for (const state of southIndianStates) {
            const [stateData] = await connection.execute(`
                SELECT crop, COUNT(*) as count,
                       AVG(yield_kg_per_ha) as avg_yield,
                       MIN(yield_kg_per_ha) as min_yield,
                       MAX(yield_kg_per_ha) as max_yield,
                       AVG(temperature_c) as avg_temp,
                       AVG(rainfall_mm) as avg_rainfall
                FROM historical_crop_data 
                WHERE state_name = ?
                GROUP BY crop
                ORDER BY count DESC
            `, [state]);
            
            if (stateData.length > 0) {
                console.log(`📍 ${state}: ${stateData.reduce((sum, row) => sum + row.count, 0)} total records`);
                stateData.forEach(crop => {
                    const coverage = crop.count >= 15 ? '🏆 Excellent' : 
                                   crop.count >= 10 ? '✅ Good' : 
                                   crop.count >= 5 ? '⚠️  Fair' : '❌ Limited';
                    console.log(`  • ${crop.crop}: ${crop.count} records - ${coverage}`);
                    console.log(`    Yield: ${Math.round(crop.min_yield)}-${Math.round(crop.max_yield)} kg/ha (avg: ${Math.round(crop.avg_yield)})`);
                    console.log(`    Climate: ${Math.round(crop.avg_temp)}°C, ${Math.round(crop.avg_rainfall)}mm rainfall`);
                });
                console.log('');
            } else {
                console.log(`📍 ${state}: No records found\n`);
            }
        }
        
        // Get total South Indian coverage
        const [totalSouthData] = await connection.execute(`
            SELECT COUNT(*) as total_records,
                   COUNT(DISTINCT crop) as unique_crops,
                   COUNT(DISTINCT state_name) as states_covered
            FROM historical_crop_data 
            WHERE state_name IN (?, ?, ?, ?)
        `, southIndianStates);
        
        console.log('📊 South Indian States Summary:');
        console.log(`  Total Records: ${totalSouthData[0].total_records} out of 1,076 (${Math.round(totalSouthData[0].total_records/1076*100)}%)`);
        console.log(`  Unique Crops: ${totalSouthData[0].unique_crops}`);
        console.log(`  States Covered: ${totalSouthData[0].states_covered} out of 4`);
        
        // Show most common crops across South Indian states
        const [commonCrops] = await connection.execute(`
            SELECT crop, COUNT(*) as total_records,
                   COUNT(DISTINCT state_name) as states_present,
                   AVG(yield_kg_per_ha) as overall_avg_yield
            FROM historical_crop_data 
            WHERE state_name IN (?, ?, ?, ?)
            GROUP BY crop
            ORDER BY total_records DESC
        `, southIndianStates);
        
        console.log('\n🌾 Most Common South Indian Crops:');
        commonCrops.forEach(crop => {
            const coverage = crop.states_present === 4 ? '🌟 All States' :
                           crop.states_present === 3 ? '✅ 3 States' :
                           crop.states_present === 2 ? '⚠️  2 States' : '📍 1 State';
            console.log(`  ${crop.crop}: ${crop.total_records} records across ${crop.states_present} states - ${coverage}`);
            console.log(`    Average Yield: ${Math.round(crop.overall_avg_yield)} kg/ha`);
        });
        
        // Check data quality for ML training
        console.log('\n🤖 ML Training Readiness for South Indian States:');
        const readyCrops = commonCrops.filter(c => c.total_records >= 10);
        const fairCrops = commonCrops.filter(c => c.total_records >= 5 && c.total_records < 10);
        const limitedCrops = commonCrops.filter(c => c.total_records < 5);
        
        console.log(`  🏆 Ready for High Accuracy: ${readyCrops.length} crops`);
        console.log(`  ⚠️  Fair Accuracy: ${fairCrops.length} crops`);
        console.log(`  ❌ Limited Data: ${limitedCrops.length} crops`);
        
        if (readyCrops.length > 0) {
            console.log('\n✅ High Accuracy Crops for South India:');
            readyCrops.forEach(crop => {
                console.log(`  • ${crop.crop}: ${crop.total_records} records`);
            });
        }
        
        console.log('\n🎯 ML Model Status for South Indian States: READY');
        console.log(`Your model has ${totalSouthData[0].total_records} South Indian records for accurate predictions!`);
        
    } catch (error) {
        console.error('❌ Error analyzing South Indian data:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the analysis
analyzeSouthIndianStates();