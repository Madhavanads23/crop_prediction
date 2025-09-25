// Mock API Server for Crop Predictions
// This serves as a fallback for testing the 5-crop prediction system

import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

// Comprehensive crop database with regional preferences
const cropDatabase = {
  'Rice': {
    baseYield: 3200,
    optimalTemp: [20, 35],
    optimalHumidity: [70, 90],
    optimalRainfall: [1000, 2000],
    preferredStates: ['West Bengal', 'Andhra Pradesh', 'Tamil Nadu', 'Punjab', 'Uttar Pradesh']
  },
  'Wheat': {
    baseYield: 3800,
    optimalTemp: [15, 25],
    optimalHumidity: [50, 70],
    optimalRainfall: [400, 800],
    preferredStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan']
  },
  'Cotton': {
    baseYield: 520,
    optimalTemp: [21, 30],
    optimalHumidity: [50, 80],
    optimalRainfall: [500, 800],
    preferredStates: ['Gujarat', 'Maharashtra', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu']
  },
  'Sugarcane': {
    baseYield: 65000,
    optimalTemp: [22, 32],
    optimalHumidity: [70, 85],
    optimalRainfall: [1200, 2000],
    preferredStates: ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat']
  },
  'Onion': {
    baseYield: 12000,
    optimalTemp: [13, 28],
    optimalHumidity: [55, 75],
    optimalRainfall: [400, 700],
    preferredStates: ['Maharashtra', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Tamil Nadu']
  },
  'Tomato': {
    baseYield: 25000,
    optimalTemp: [18, 29],
    optimalHumidity: [60, 80],
    optimalRainfall: [400, 600],
    preferredStates: ['Karnataka', 'Andhra Pradesh', 'Maharashtra', 'Gujarat', 'Tamil Nadu']
  },
  'Potato': {
    baseYield: 22000,
    optimalTemp: [15, 25],
    optimalHumidity: [60, 85],
    optimalRainfall: [500, 750],
    preferredStates: ['Uttar Pradesh', 'Punjab', 'Haryana', 'West Bengal', 'Bihar']
  },
  'Soybean': {
    baseYield: 1200,
    optimalTemp: [20, 30],
    optimalHumidity: [60, 80],
    optimalRainfall: [600, 1000],
    preferredStates: ['Madhya Pradesh', 'Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Gujarat']
  },
  'Groundnut': {
    baseYield: 1500,
    optimalTemp: [22, 30],
    optimalHumidity: [50, 75],
    optimalRainfall: [500, 750],
    preferredStates: ['Gujarat', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Maharashtra']
  },
  'Maize': {
    baseYield: 2500,
    optimalTemp: [21, 30],
    optimalHumidity: [50, 70],
    optimalRainfall: [500, 800],
    preferredStates: ['Karnataka', 'Andhra Pradesh', 'Maharashtra', 'Tamil Nadu', 'Gujarat']
  }
};

function calculateSuitabilityScore(crop, conditions, state) {
  const cropData = cropDatabase[crop];
  if (!cropData) return 50;

  let score = 50; // Base score
  const { temperature, humidity, rainfall } = conditions;

  // Temperature suitability (25 points max)
  const [tempMin, tempMax] = cropData.optimalTemp;
  if (temperature >= tempMin && temperature <= tempMax) {
    score += 25;
  } else {
    const tempDeviation = Math.min(
      Math.abs(temperature - tempMin),
      Math.abs(temperature - tempMax)
    );
    score -= Math.min(25, tempDeviation * 2);
  }

  // Humidity suitability (15 points max)
  const [humidityMin, humidityMax] = cropData.optimalHumidity;
  if (humidity >= humidityMin && humidity <= humidityMax) {
    score += 15;
  } else {
    const humidityDeviation = Math.min(
      Math.abs(humidity - humidityMin),
      Math.abs(humidity - humidityMax)
    );
    score -= Math.min(15, humidityDeviation * 0.3);
  }

  // Rainfall suitability (10 points max)
  const [rainfallMin, rainfallMax] = cropData.optimalRainfall;
  if (rainfall >= rainfallMin && rainfall <= rainfallMax) {
    score += 10;
  } else {
    const rainfallDeviation = Math.min(
      Math.abs(rainfall - rainfallMin),
      Math.abs(rainfall - rainfallMax)
    );
    score -= Math.min(10, rainfallDeviation * 0.01);
  }

  // State preference bonus (5 points max)
  if (cropData.preferredStates.includes(state)) {
    score += 5;
  }

  return Math.max(10, Math.min(95, Math.round(score)));
}

function generateRecommendation(crop, score, state) {
  const suitabilityLevel = 
    score >= 80 ? 'excellent' :
    score >= 65 ? 'good' :
    score >= 50 ? 'moderate' : 'challenging';

  const baseRecommendations = {
    'excellent': `${crop} shows excellent potential in ${state}. Current conditions are highly favorable for optimal yield.`,
    'good': `${crop} is well-suited for cultivation in ${state}. Conditions support good agricultural outcomes.`,
    'moderate': `${crop} can be grown in ${state} with proper management. Monitor conditions closely for best results.`,
    'challenging': `${crop} cultivation in ${state} may require additional care and management due to current conditions.`
  };

  return baseRecommendations[suitabilityLevel];
}

app.post('/api/predict', (req, res) => {
  try {
    console.log('🌾 Crop Prediction API Called:', req.body);
    
    const { state, district, temperature, humidity, rainfall, ph } = req.body;
    
    // Validate input
    if (!state || !temperature || !humidity || !rainfall) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    const conditions = {
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      rainfall: parseFloat(rainfall),
      ph: parseFloat(ph) || 6.5
    };

    console.log('🌍 Conditions:', conditions);

    // Calculate suitability for all crops
    const predictions = [];
    
    Object.keys(cropDatabase).forEach(crop => {
      const score = calculateSuitabilityScore(crop, conditions, state);
      const cropData = cropDatabase[crop];
      
      // Calculate adjusted yield based on suitability
      const yieldMultiplier = 0.7 + (score / 100) * 0.6; // 0.7 to 1.3 range
      const predictedYield = Math.round(cropData.baseYield * yieldMultiplier);
      
      predictions.push({
        crop,
        predictedYield,
        confidence: score,
        suitabilityScore: score,
        recommendation: generateRecommendation(crop, score, state)
      });
    });

    // Sort by suitability score and take top 5
    predictions.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    const top5Predictions = predictions.slice(0, 5);

    console.log('🏆 Top 5 Predictions:', top5Predictions.map(p => `${p.crop}: ${p.suitabilityScore}%`));

    res.json({
      success: true,
      predictions: top5Predictions,
      location: `${district}, ${state}`,
      conditions,
      message: `Generated top 5 crop recommendations for ${district}, ${state}`
    });

  } catch (error) {
    console.error('❌ Prediction API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Crop Prediction API',
    crops: Object.keys(cropDatabase).length,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Crop Prediction API Server running on port ${PORT}`);
  console.log(`📊 Database loaded with ${Object.keys(cropDatabase).length} crop varieties`);
  console.log(`🌾 Available crops: ${Object.keys(cropDatabase).join(', ')}`);
});