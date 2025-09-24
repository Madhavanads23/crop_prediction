const mysql = require('mysql2/promise');

class ContinuousLearningSystem {
    constructor() {
        this.connection = null;
    }

    async connect() {
        this.connection = await mysql.createConnection({
            host: 'localhost',
            user: 'agrismart_user',
            password: 'agrismart_mysql_2025',
            database: 'agrismart_db',
            port: 3306
        });
    }

    // Add user feedback to improve model
    async addUserFeedback(prediction, userInput, actualOutcome) {
        try {
            // Create a feedback table if it doesn't exist
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS user_feedback (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    state_name VARCHAR(64),
                    district_name VARCHAR(64),
                    predicted_crop VARCHAR(64),
                    actual_crop VARCHAR(64),
                    predicted_yield FLOAT,
                    actual_yield FLOAT,
                    temperature_c FLOAT,
                    humidity_percent FLOAT,
                    rainfall_mm FLOAT,
                    ph FLOAT,
                    n_fertilizer FLOAT,
                    p_fertilizer FLOAT,
                    k_fertilizer FLOAT,
                    confidence_score FLOAT,
                    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_feedback_crop (predicted_crop, actual_crop)
                ) ENGINE=InnoDB
            `);

            // Insert feedback
            await this.connection.execute(`
                INSERT INTO user_feedback 
                (state_name, district_name, predicted_crop, actual_crop, predicted_yield, 
                 actual_yield, temperature_c, humidity_percent, rainfall_mm, ph, 
                 n_fertilizer, p_fertilizer, k_fertilizer, confidence_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                userInput.state, userInput.district, prediction.crop, actualOutcome.crop,
                prediction.predictedYield, actualOutcome.actualYield, userInput.temperature,
                userInput.humidity, userInput.rainfall, userInput.ph, userInput.n_fertilizer,
                userInput.p_fertilizer, userInput.k_fertilizer, prediction.confidence
            ]);

            console.log('✅ User feedback recorded for continuous learning');
            
        } catch (error) {
            console.error('❌ Error recording feedback:', error.message);
        }
    }

    // Add synthetic training data for specific scenarios
    async generateSyntheticData(crop, baseConditions, variations = 10) {
        console.log(`🧪 Generating ${variations} synthetic records for ${crop}...`);
        
        // Get existing data for this crop to understand patterns
        const [existing] = await this.connection.execute(`
            SELECT AVG(yield_kg_per_ha) as avg_yield, 
                   AVG(temperature_c) as avg_temp,
                   AVG(humidity_percent) as avg_humidity,
                   AVG(rainfall_mm) as avg_rainfall,
                   AVG(ph) as avg_ph
            FROM historical_crop_data 
            WHERE crop = ?
        `, [crop]);

        if (existing.length === 0) {
            console.log(`⚠️  No existing data for ${crop}, using defaults`);
            return;
        }

        const base = existing[0];
        const syntheticRecords = [];

        for (let i = 0; i < variations; i++) {
            // Add realistic variations
            const tempVariation = (Math.random() - 0.5) * 6; // ±3°C
            const humidityVariation = (Math.random() - 0.5) * 20; // ±10%
            const rainfallVariation = (Math.random() - 0.5) * 400; // ±200mm
            const yieldVariation = (Math.random() - 0.5) * 0.3; // ±15% yield variation

            const syntheticRecord = [
                1000 + i, // dist_code
                2024, // crop_year
                99, // synthetic state_code
                'Synthetic_State',
                `Synthetic_District_${i}`,
                crop,
                baseConditions.area || 100,
                base.avg_yield * (1 + yieldVariation),
                (base.avg_yield * (1 + yieldVariation)) * (baseConditions.area || 100),
                base.avg_temp + tempVariation,
                Math.max(30, Math.min(90, base.avg_humidity + humidityVariation)),
                Math.max(100, base.avg_rainfall + rainfallVariation),
                Math.max(5.5, Math.min(8.5, base.avg_ph + (Math.random() - 0.5) * 1)),
                baseConditions.n_fertilizer || 120,
                baseConditions.p_fertilizer || 80,
                baseConditions.k_fertilizer || 60,
                5 + Math.random() * 10, // wind_speed
                15 + Math.random() * 10  // solar_radiation
            ];

            syntheticRecords.push(syntheticRecord);
        }

        // Insert synthetic records
        const insertSQL = `
            INSERT INTO historical_crop_data 
            (dist_code, crop_year, state_code, state_name, district_name, crop, area_hectares, 
             yield_kg_per_ha, production_tonnes, temperature_c, humidity_percent, rainfall_mm, 
             ph, n_fertilizer, p_fertilizer, k_fertilizer, wind_speed, solar_radiation) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let inserted = 0;
        for (const record of syntheticRecords) {
            try {
                await this.connection.execute(insertSQL, record);
                inserted++;
            } catch (error) {
                // Skip duplicates
            }
        }

        console.log(`✅ Generated ${inserted} synthetic records for ${crop}`);
        return inserted;
    }

    // Analyze model performance and suggest improvements
    async analyzeModelPerformance() {
        console.log('📊 Analyzing ML Model Performance...\n');

        // Check data distribution
        const [cropDistribution] = await this.connection.execute(`
            SELECT crop, COUNT(*) as count,
                   AVG(yield_kg_per_ha) as avg_yield,
                   MIN(yield_kg_per_ha) as min_yield,
                   MAX(yield_kg_per_ha) as max_yield
            FROM historical_crop_data 
            GROUP BY crop 
            ORDER BY count DESC
        `);

        console.log('🌾 Crop Data Distribution:');
        cropDistribution.forEach(crop => {
            const coverage = crop.count >= 10 ? '✅ Good' : 
                           crop.count >= 5 ? '⚠️  Limited' : '❌ Poor';
            console.log(`  ${crop.crop}: ${crop.count} records - ${coverage}`);
            console.log(`    Yield Range: ${Math.round(crop.min_yield)}-${Math.round(crop.max_yield)} kg/ha (avg: ${Math.round(crop.avg_yield)})`);
        });

        // Check state coverage
        const [stateDistribution] = await this.connection.execute(`
            SELECT state_name, COUNT(*) as count,
                   COUNT(DISTINCT crop) as crop_variety
            FROM historical_crop_data 
            GROUP BY state_name 
            ORDER BY count DESC
        `);

        console.log('\n🗺️  State Coverage:');
        stateDistribution.forEach(state => {
            console.log(`  ${state.state_name}: ${state.count} records, ${state.crop_variety} different crops`);
        });

        // Identify data gaps
        const lowDataCrops = cropDistribution.filter(crop => crop.count < 10);
        if (lowDataCrops.length > 0) {
            console.log('\n⚠️  Crops Needing More Data:');
            lowDataCrops.forEach(crop => {
                console.log(`  - ${crop.crop}: Only ${crop.count} records`);
            });
        }

        return {
            totalRecords: cropDistribution.reduce((sum, crop) => sum + crop.count, 0),
            cropVariety: cropDistribution.length,
            statesCovered: stateDistribution.length,
            lowDataCrops: lowDataCrops.map(c => c.crop)
        };
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
        }
    }
}

// Demo function to show continuous learning in action
async function demonstrateContinuousLearning() {
    const learningSystem = new ContinuousLearningSystem();
    
    try {
        await learningSystem.connect();
        
        // Analyze current model
        const analysis = await learningSystem.analyzeModelPerformance();
        
        console.log('\n🎯 Model Improvement Recommendations:');
        
        if (analysis.lowDataCrops.length > 0) {
            console.log('1. Generate synthetic data for under-represented crops');
            
            // Generate synthetic data for crops with low coverage
            for (const crop of analysis.lowDataCrops.slice(0, 2)) { // Limit to 2 crops for demo
                await learningSystem.generateSyntheticData(crop, {
                    area: 100,
                    n_fertilizer: 100,
                    p_fertilizer: 70,
                    k_fertilizer: 50
                }, 5);
            }
        }

        console.log('\n2. Model is ready for continuous learning from user feedback');
        console.log('3. Consider adding more diverse geographical regions');
        
        // Show updated stats
        console.log('\n📈 Updated Model Statistics:');
        const updatedAnalysis = await learningSystem.analyzeModelPerformance();
        console.log(`  Total Records: ${updatedAnalysis.totalRecords}`);
        console.log(`  Crop Varieties: ${updatedAnalysis.cropVariety}`);
        console.log(`  States Covered: ${updatedAnalysis.statesCovered}`);

        await learningSystem.close();
        
    } catch (error) {
        console.error('❌ Error in continuous learning demo:', error.message);
    }
}

module.exports = { ContinuousLearningSystem };

// Run demo if this file is executed directly
if (require.main === module) {
    demonstrateContinuousLearning();
}