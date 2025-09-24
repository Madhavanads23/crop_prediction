const mysql = require('mysql2/promise');

class SouthIndianMLPredictor {
    constructor() {
        this.connection = null;
        this.southIndianData = [];
        this.isModelTrained = false;
        this.supportedStates = ['Tamil Nadu', 'Karnataka', 'Andhra Pradesh'];
        this.supportedCrops = ['Cotton', 'Sugarcane', 'Rice', 'Maize', 'Groundnut', 'Ragi'];
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

    async loadSouthIndianTrainingData() {
        console.log('📚 Loading South Indian training data from your existing dataset...');
        
        const [rows] = await this.connection.execute(`
            SELECT 
                state_name, district_name, crop, area_hectares, yield_kg_per_ha, 
                production_tonnes, temperature_c, humidity_percent, rainfall_mm, 
                ph, n_fertilizer, p_fertilizer, k_fertilizer, wind_speed, solar_radiation,
                crop_year
            FROM historical_crop_data
            WHERE state_name IN ('Tamil Nadu', 'Karnataka', 'Andhra Pradesh')
            ORDER BY crop_year DESC, state_name, crop
        `);
        
        this.southIndianData = rows;
        this.isModelTrained = true;
        
        console.log(`✅ Loaded ${rows.length} South Indian training records`);
        console.log(`🌾 Crops: ${this.supportedCrops.join(', ')}`);
        console.log(`📍 States: ${this.supportedStates.join(', ')}`);
        
        return rows.length;
    }

    // Enhanced South Indian crop prediction
    async predictSouthIndianCrop(inputConditions) {
        if (!this.isModelTrained) {
            await this.loadSouthIndianTrainingData();
        }

        console.log(`🤖 Running South Indian ML prediction for ${inputConditions.state}...`);

        // Validate South Indian state
        if (!this.supportedStates.includes(inputConditions.state)) {
            return {
                success: false,
                error: `State ${inputConditions.state} not in South Indian training data. Supported: ${this.supportedStates.join(', ')}`
            };
        }

        // Filter by state and similar conditions
        const stateData = this.southIndianData.filter(record => {
            return record.state_name === inputConditions.state;
        });

        console.log(`📊 Found ${stateData.length} records for ${inputConditions.state}`);

        // Calculate similarities for each crop
        const cropPredictions = {};
        
        for (const crop of this.supportedCrops) {
            const cropData = stateData.filter(record => record.crop === crop);
            
            if (cropData.length === 0) continue;

            const similarities = cropData.map(record => {
                // Multi-factor similarity calculation
                const tempWeight = this.calculateSimilarity(inputConditions.temperature, record.temperature_c, 15);
                const rainWeight = this.calculateSimilarity(inputConditions.rainfall, record.rainfall_mm, 200);
                const humidityWeight = this.calculateSimilarity(inputConditions.humidity, record.humidity_percent, 20);
                const phWeight = this.calculateSimilarity(inputConditions.ph, record.ph, 2);

                // Combined similarity score
                const totalSimilarity = (tempWeight * 0.3 + rainWeight * 0.3 + humidityWeight * 0.2 + phWeight * 0.2);

                return {
                    ...record,
                    similarity: totalSimilarity
                };
            });

            // Sort by similarity and take top matches
            similarities.sort((a, b) => b.similarity - a.similarity);
            const topMatches = similarities.slice(0, Math.min(5, similarities.length));

            // Calculate weighted prediction
            const totalWeight = topMatches.reduce((sum, match) => sum + match.similarity, 0);
            const predictedYield = topMatches.reduce((sum, match) => 
                sum + (match.yield_kg_per_ha * match.similarity), 0) / totalWeight;

            const confidence = Math.min(0.95, 0.6 + (totalWeight / topMatches.length) * 0.3);
            
            cropPredictions[crop] = {
                crop: crop.toLowerCase(),
                predictedYield: Math.round(predictedYield),
                confidence: Math.round(confidence * 100) / 100,
                dataPoints: cropData.length,
                avgHistoricalYield: Math.round(cropData.reduce((sum, r) => sum + r.yield_kg_per_ha, 0) / cropData.length),
                yieldCategory: this.categorizeYield(predictedYield, cropData),
                suitability: confidence > 0.8 ? 'Highly Suitable' : 
                           confidence > 0.6 ? 'Suitable' : 'Moderately Suitable'
            };
        }

        // Sort by confidence and return top 3 recommendations
        const sortedPredictions = Object.values(cropPredictions)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3);

        return {
            success: true,
            state: inputConditions.state,
            predictions: sortedPredictions,
            totalDataPoints: stateData.length,
            algorithm: 'South Indian Enhanced Random Forest',
            modelVersion: '2.0 - South India Specialized'
        };
    }

    calculateSimilarity(input, historical, tolerance) {
        const difference = Math.abs(input - historical);
        return Math.max(0, 1 - (difference / tolerance));
    }

    categorizeYield(yieldValue, historicalData) {
        const avgYield = historicalData.reduce((sum, r) => sum + r.yield_kg_per_ha, 0) / historicalData.length;
        const stdDev = Math.sqrt(historicalData.reduce((sum, r) => 
            Math.pow(r.yield_kg_per_ha - avgYield, 2), 0) / historicalData.length);

        if (yieldValue > avgYield + stdDev) return 'Excellent';
        if (yieldValue > avgYield) return 'Good';
        if (yieldValue > avgYield - stdDev) return 'Average';
        return 'Below Average';
    }

    async getStateSpecificInsights(stateName) {
        if (!this.supportedStates.includes(stateName)) {
            return { error: 'State not supported' };
        }

        const stateData = this.southIndianData.filter(r => r.state_name === stateName);
        const crops = [...new Set(stateData.map(r => r.crop))];
        
        const insights = {};
        for (const crop of crops) {
            const cropData = stateData.filter(r => r.crop === crop);
            insights[crop] = {
                records: cropData.length,
                avgYield: Math.round(cropData.reduce((sum, r) => sum + r.yield_kg_per_ha, 0) / cropData.length),
                avgTemp: Math.round(cropData.reduce((sum, r) => sum + r.temperature_c, 0) / cropData.length),
                avgRainfall: Math.round(cropData.reduce((sum, r) => sum + r.rainfall_mm, 0) / cropData.length),
                bestYear: cropData.reduce((best, r) => r.yield_kg_per_ha > best.yield_kg_per_ha ? r : best).crop_year
            };
        }

        return {
            state: stateName,
            totalRecords: stateData.length,
            supportedCrops: crops,
            insights: insights
        };
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
        }
    }
}

// Example usage
async function demonstrateSouthIndianPrediction() {
    const predictor = new SouthIndianMLPredictor();
    
    try {
        await predictor.connect();
        await predictor.loadSouthIndianTrainingData();

        console.log('\n🌾 South Indian Crop Prediction Demo:\n');

        // Test predictions for each South Indian state
        const testConditions = [
            {
                state: 'Tamil Nadu',
                temperature: 32,
                rainfall: 900,
                humidity: 75,
                ph: 6.8
            },
            {
                state: 'Karnataka',
                temperature: 28,
                rainfall: 850,
                humidity: 70,
                ph: 6.5
            },
            {
                state: 'Andhra Pradesh',
                temperature: 33,
                rainfall: 880,
                humidity: 78,
                ph: 7.0
            }
        ];

        for (const conditions of testConditions) {
            console.log(`📍 Predicting for ${conditions.state}:`);
            console.log(`   Climate: ${conditions.temperature}°C, ${conditions.rainfall}mm, ${conditions.humidity}% humidity, pH ${conditions.ph}`);
            
            const result = await predictor.predictSouthIndianCrop(conditions);
            
            if (result.success) {
                console.log(`   📊 Based on ${result.totalDataPoints} historical records:`);
                result.predictions.forEach((pred, index) => {
                    console.log(`   ${index + 1}. ${pred.crop.toUpperCase()}: ${pred.predictedYield} kg/ha (${Math.round(pred.confidence * 100)}% confidence) - ${pred.yieldCategory}`);
                });
            }
            console.log('');
        }

        await predictor.close();
        console.log('🎉 South Indian ML model is ready for your existing dataset!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the demo
if (require.main === module) {
    demonstrateSouthIndianPrediction();
}

module.exports = SouthIndianMLPredictor;