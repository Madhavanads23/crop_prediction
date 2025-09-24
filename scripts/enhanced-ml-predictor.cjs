const mysql = require('mysql2/promise');

class EnhancedMLPredictor {
    constructor() {
        this.connection = null;
        this.trainingData = [];
        this.isModelTrained = false;
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

    async loadTrainingData() {
        const [rows] = await this.connection.execute(`
            SELECT 
                state_name, district_name, crop, area_hectares, yield_kg_per_ha, 
                production_tonnes, temperature_c, humidity_percent, rainfall_mm, 
                ph, n_fertilizer, p_fertilizer, k_fertilizer, wind_speed, solar_radiation
            FROM historical_crop_data
            ORDER BY crop_year DESC
        `);
        
        this.trainingData = rows;
        this.isModelTrained = true;
        console.log(`✅ Loaded ${rows.length} training records`);
    }

    // Enhanced similarity calculation with weighted features
    calculateSimilarity(input, record) {
        const weights = {
            temperature_c: 0.2,
            humidity_percent: 0.15,
            rainfall_mm: 0.2,
            ph: 0.15,
            n_fertilizer: 0.1,
            p_fertilizer: 0.1,
            k_fertilizer: 0.1
        };

        let totalSimilarity = 0;
        let totalWeight = 0;

        for (const [feature, weight] of Object.entries(weights)) {
            if (input[feature] !== undefined && record[feature] !== undefined) {
                const inputVal = parseFloat(input[feature]);
                const recordVal = parseFloat(record[feature]);
                
                // Normalize difference based on typical ranges
                const ranges = {
                    temperature_c: 20,
                    humidity_percent: 50,
                    rainfall_mm: 1000,
                    ph: 4,
                    n_fertilizer: 100,
                    p_fertilizer: 100,
                    k_fertilizer: 100
                };

                const normalizedDiff = Math.abs(inputVal - recordVal) / ranges[feature];
                const similarity = Math.exp(-normalizedDiff); // Exponential decay
                
                totalSimilarity += similarity * weight;
                totalWeight += weight;
            }
        }

        // Location bonus - same state gets higher similarity
        if (input.state === record.state_name) {
            totalSimilarity += 0.1;
            totalWeight += 0.1;
        }

        return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
    }

    // Advanced prediction with multiple algorithms
    async predictCrop(inputConditions) {
        if (!this.isModelTrained) {
            await this.loadTrainingData();
        }

        console.log(`🤖 Running enhanced ML prediction for ${inputConditions.state}...`);

        // Step 1: Filter by similar conditions and location
        const relevantRecords = this.trainingData.filter(record => {
            // Filter by state if provided
            if (inputConditions.state && record.state_name !== inputConditions.state) {
                return false;
            }
            
            // Filter by reasonable temperature range
            const tempDiff = Math.abs(record.temperature_c - inputConditions.temperature);
            return tempDiff <= 10; // Within 10°C
        });

        console.log(`📊 Found ${relevantRecords.length} relevant historical records`);

        // Step 2: Calculate similarities and get top matches
        const similarities = relevantRecords.map(record => ({
            ...record,
            similarity: this.calculateSimilarity(inputConditions, record)
        }));

        similarities.sort((a, b) => b.similarity - a.similarity);
        const topMatches = similarities.slice(0, 15); // Use top 15 matches

        // Step 3: Group by crop and calculate weighted averages
        const cropPredictions = {};
        
        topMatches.forEach(match => {
            if (!cropPredictions[match.crop]) {
                cropPredictions[match.crop] = {
                    crop: match.crop,
                    totalWeight: 0,
                    weightedYield: 0,
                    count: 0,
                    avgSimilarity: 0,
                    examples: []
                };
            }

            const weight = match.similarity;
            cropPredictions[match.crop].totalWeight += weight;
            cropPredictions[match.crop].weightedYield += match.yield_kg_per_ha * weight;
            cropPredictions[match.crop].count += 1;
            cropPredictions[match.crop].avgSimilarity += match.similarity;
            cropPredictions[match.crop].examples.push({
                location: `${match.state_name}, ${match.district_name}`,
                yield: match.yield_kg_per_ha,
                similarity: match.similarity
            });
        });

        // Step 4: Calculate final predictions
        const predictions = Object.values(cropPredictions).map(crop => {
            const predictedYield = crop.totalWeight > 0 ? 
                crop.weightedYield / crop.totalWeight : 0;
            
            const confidence = Math.min(95, 
                (crop.avgSimilarity / crop.count) * 100 + 
                Math.min(crop.count * 5, 20) // Bonus for more examples
            );

            return {
                crop: crop.crop,
                predictedYield: Math.round(predictedYield),
                confidence: Math.round(confidence),
                supportingRecords: crop.count,
                examples: crop.examples.slice(0, 3) // Top 3 examples
            };
        });

        // Sort by confidence
        predictions.sort((a, b) => b.confidence - a.confidence);

        return predictions.slice(0, 5); // Return top 5 predictions
    }

    // Get crop recommendations with market insights
    async getCropRecommendations(inputConditions) {
        const predictions = await this.predictCrop(inputConditions);
        
        // Add market insights and recommendations
        const marketInsights = {
            'Wheat': { demand: 'High', price_trend: 'Stable', season: 'Rabi' },
            'Rice': { demand: 'Very High', price_trend: 'Rising', season: 'Kharif' },
            'Cotton': { demand: 'High', price_trend: 'Volatile', season: 'Kharif' },
            'Sugarcane': { demand: 'Stable', price_trend: 'Steady', season: 'Year-round' },
            'Onion': { demand: 'High', price_trend: 'Seasonal', season: 'Rabi' },
            'Bajra': { demand: 'Medium', price_trend: 'Stable', season: 'Kharif' },
            'Groundnut': { demand: 'High', price_trend: 'Rising', season: 'Kharif' },
            'Soybean': { demand: 'High', price_trend: 'Strong', season: 'Kharif' },
            'Ragi': { demand: 'Growing', price_trend: 'Rising', season: 'Kharif' }
        };

        return predictions.map(pred => {
            const market = marketInsights[pred.crop] || { 
                demand: 'Medium', 
                price_trend: 'Stable', 
                season: 'Unknown' 
            };

            return {
                ...pred,
                marketDemand: market.demand,
                priceTrend: market.price_trend,
                growingSeason: market.season,
                recommendation: this.generateRecommendation(pred, market, inputConditions)
            };
        });
    }

    generateRecommendation(prediction, market, conditions) {
        const yieldCategory = prediction.predictedYield > 3000 ? 'High' : 
                             prediction.predictedYield > 1500 ? 'Medium' : 'Low';
        
        let recommendation = `${prediction.crop} shows ${yieldCategory.toLowerCase()} yield potential (${prediction.predictedYield} kg/ha) `;
        recommendation += `with ${prediction.confidence}% confidence based on ${prediction.supportingRecords} similar cases. `;
        recommendation += `Market demand is ${market.demand.toLowerCase()} with ${market.price_trend.toLowerCase()} prices. `;
        
        if (prediction.confidence > 80) {
            recommendation += "Highly recommended based on your conditions.";
        } else if (prediction.confidence > 60) {
            recommendation += "Good option worth considering.";
        } else {
            recommendation += "Consider with caution - limited historical data.";
        }

        return recommendation;
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
        }
    }
}

// Test the enhanced predictor
async function testEnhancedPredictor() {
    const predictor = new EnhancedMLPredictor();
    
    try {
        await predictor.connect();
        
        // Test with sample input
        const testInput = {
            state: 'Punjab',
            district: 'Test District',
            temperature: 25,
            humidity: 65,
            rainfall: 500,
            ph: 7.2,
            n_fertilizer: 120,
            p_fertilizer: 80,
            k_fertilizer: 60
        };

        console.log('🧪 Testing Enhanced ML Predictor...\n');
        const recommendations = await predictor.getCropRecommendations(testInput);
        
        console.log('🏆 Top Crop Recommendations:\n');
        recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec.crop}`);
            console.log(`   Predicted Yield: ${rec.predictedYield} kg/ha`);
            console.log(`   Confidence: ${rec.confidence}%`);
            console.log(`   Market Demand: ${rec.marketDemand}`);
            console.log(`   Price Trend: ${rec.priceTrend}`);
            console.log(`   Supporting Records: ${rec.supportingRecords}`);
            console.log(`   Recommendation: ${rec.recommendation}\n`);
        });

        await predictor.close();
        
    } catch (error) {
        console.error('❌ Error testing predictor:', error.message);
    }
}

module.exports = { EnhancedMLPredictor };

// Run test if this file is executed directly
if (require.main === module) {
    testEnhancedPredictor();
}