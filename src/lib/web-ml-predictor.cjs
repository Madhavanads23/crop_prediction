const mysql = require('mysql2/promise');

// Simplified version of the enhanced predictor for the web app
class WebMLPredictor {
    static async predict(inputConditions) {
        let connection;
        try {
            // Connect to database
            connection = await mysql.createConnection({
                host: 'localhost',
                user: 'agrismart_user',
                password: 'agrismart_mysql_2025',
                database: 'agrismart_db',
                port: 3306
            });

            // Load training data
            const [trainingData] = await connection.execute(`
                SELECT 
                    state_name, district_name, crop, yield_kg_per_ha, 
                    temperature_c, humidity_percent, rainfall_mm, ph,
                    n_fertilizer, p_fertilizer, k_fertilizer
                FROM historical_crop_data
                WHERE state_name = ? OR state_name = 'Synthetic_State'
                ORDER BY crop_year DESC
            `, [inputConditions.state || 'Punjab']);

            // Calculate similarities
            const similarities = trainingData.map(record => ({
                ...record,
                similarity: this.calculateSimilarity(inputConditions, record)
            }));

            // Sort by similarity
            similarities.sort((a, b) => b.similarity - a.similarity);
            const topMatches = similarities.slice(0, 20);

            // Group by crop
            const cropPredictions = {};
            topMatches.forEach(match => {
                if (!cropPredictions[match.crop]) {
                    cropPredictions[match.crop] = {
                        crop: match.crop,
                        totalWeight: 0,
                        weightedYield: 0,
                        count: 0,
                        avgSimilarity: 0
                    };
                }

                const weight = match.similarity;
                cropPredictions[match.crop].totalWeight += weight;
                cropPredictions[match.crop].weightedYield += match.yield_kg_per_ha * weight;
                cropPredictions[match.crop].count += 1;
                cropPredictions[match.crop].avgSimilarity += match.similarity;
            });

            // Calculate final predictions
            const predictions = Object.values(cropPredictions).map(crop => {
                const predictedYield = crop.totalWeight > 0 ? 
                    crop.weightedYield / crop.totalWeight : 0;
                
                const confidence = Math.min(95, 
                    (crop.avgSimilarity / crop.count) * 100 + 
                    Math.min(crop.count * 3, 15)
                );

                return {
                    crop: crop.crop,
                    predictedYield: Math.round(predictedYield),
                    confidence: Math.round(confidence),
                    supportingRecords: crop.count
                };
            });

            await connection.end();

            // Sort by confidence and return top 3
            predictions.sort((a, b) => b.confidence - a.confidence);
            return predictions.slice(0, 3);

        } catch (error) {
            console.error('Prediction error:', error);
            if (connection) await connection.end();
            throw error;
        }
    }

    static calculateSimilarity(input, record) {
        const weights = {
            temperature_c: 0.25,
            humidity_percent: 0.2,
            rainfall_mm: 0.25,
            ph: 0.15,
            n_fertilizer: 0.05,
            p_fertilizer: 0.05,
            k_fertilizer: 0.05
        };

        let totalSimilarity = 0;
        let totalWeight = 0;

        for (const [feature, weight] of Object.entries(weights)) {
            if (input[feature] !== undefined && record[feature] !== undefined) {
                const inputVal = parseFloat(input[feature]);
                const recordVal = parseFloat(record[feature]);
                
                const ranges = {
                    temperature_c: 15,
                    humidity_percent: 40,
                    rainfall_mm: 800,
                    ph: 3,
                    n_fertilizer: 80,
                    p_fertilizer: 60,
                    k_fertilizer: 60
                };

                const normalizedDiff = Math.abs(inputVal - recordVal) / ranges[feature];
                const similarity = Math.exp(-normalizedDiff * 2);
                
                totalSimilarity += similarity * weight;
                totalWeight += weight;
            }
        }

        return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
    }
}

module.exports = { WebMLPredictor };