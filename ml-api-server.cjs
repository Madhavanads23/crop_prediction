
const express = require('express');
const cors = require('cors');
// Updated to use Python ML Bridge instead of JavaScript predictor
const { WebMLPredictor } = require('./src/lib/python-ml-bridge.cjs');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// ML Prediction endpoint
app.post('/api/predict', async (req, res) => {
    try {
        console.log('🤖 Received prediction request:', req.body);
        
        const inputConditions = {
            state: req.body.state,
            district: req.body.district,
            temperature: parseFloat(req.body.temperature),
            humidity: parseFloat(req.body.humidity),
            rainfall: parseFloat(req.body.rainfall),
            ph: parseFloat(req.body.ph),
            n_fertilizer: parseFloat(req.body.n_fertilizer) || 120,
            p_fertilizer: parseFloat(req.body.p_fertilizer) || 80,
            k_fertilizer: parseFloat(req.body.k_fertilizer) || 60
        };

        const predictions = await WebMLPredictor.predict(inputConditions);
        
        // Add market insights
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

        const enrichedPredictions = predictions.map(pred => {
            const market = marketInsights[pred.crop] || { 
                demand: 'Medium', 
                price_trend: 'Stable', 
                season: 'Unknown' 
            };

            let recommendation = `${pred.crop} shows `;
            recommendation += pred.predictedYield > 3000 ? 'high' : 
                            pred.predictedYield > 1500 ? 'medium' : 'low';
            recommendation += ` yield potential (${pred.predictedYield} kg/ha) with ${pred.confidence}% confidence. `;
            recommendation += `Market demand is ${market.demand.toLowerCase()} with ${market.price_trend.toLowerCase()} prices.`;

            return {
                ...pred,
                marketDemand: market.demand,
                priceTrend: market.price_trend,
                growingSeason: market.season,
                recommendation
            };
        });

        console.log('✅ Returning predictions:', enrichedPredictions);
        res.json({ success: true, predictions: enrichedPredictions });

    } catch (error) {
        console.error('❌ Prediction error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate predictions',
            message: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'AgriSmart ML API is running' });
});

// Get model statistics
app.get('/api/stats', async (req, res) => {
    try {
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'agrismart_user',
            password: 'agrismart_mysql_2025',
            database: 'agrismart_db',
            port: 3306
        });

        const [totalRecords] = await connection.execute('SELECT COUNT(*) as total FROM historical_crop_data');
        const [cropCounts] = await connection.execute('SELECT COUNT(DISTINCT crop) as crops FROM historical_crop_data');
        const [stateCounts] = await connection.execute('SELECT COUNT(DISTINCT state_name) as states FROM historical_crop_data');

        await connection.end();

        res.json({
            totalRecords: totalRecords[0].total,
            cropVarieties: cropCounts[0].crops,
            statesCovered: stateCounts[0].states,
            modelType: 'Enhanced Random Forest',
            status: 'Trained and Ready'
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

app.listen(port, () => {
    console.log(`🚀 AgriSmart ML API Server running at http://localhost:${port}`);
    console.log('📊 Available endpoints:');
    console.log('  POST /api/predict - Get crop predictions');
    console.log('  GET /api/health - Health check');
    console.log('  GET /api/stats - Model statistics');
});