import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Comprehensive crop database with 25+ crops
const crops = {
  // Cereals
  'Rice': { yield: 3200, temp: [20, 35], humidity: [70, 90], rainfall: [1000, 2000], season: 'Kharif', marketPrice: 2800 },
  'Wheat': { yield: 3800, temp: [15, 25], humidity: [50, 70], rainfall: [400, 800], season: 'Rabi', marketPrice: 2200 },
  'Maize': { yield: 5500, temp: [21, 27], humidity: [60, 70], rainfall: [600, 1200], season: 'Kharif', marketPrice: 1800 },
  'Barley': { yield: 3000, temp: [12, 25], humidity: [50, 65], rainfall: [300, 600], season: 'Rabi', marketPrice: 1600 },
  'Millets': { yield: 2800, temp: [25, 35], humidity: [40, 60], rainfall: [300, 700], season: 'Kharif', marketPrice: 3200 },
  'Sorghum': { yield: 3500, temp: [26, 30], humidity: [50, 70], rainfall: [400, 800], season: 'Kharif', marketPrice: 2400 },
  
  // Cash Crops
  'Cotton': { yield: 520, temp: [21, 30], humidity: [50, 80], rainfall: [500, 800], season: 'Kharif', marketPrice: 6000 },
  'Sugarcane': { yield: 65000, temp: [22, 32], humidity: [70, 85], rainfall: [1200, 2000], season: 'Annual', marketPrice: 350 },
  'Jute': { yield: 2200, temp: [24, 37], humidity: [70, 90], rainfall: [1200, 2500], season: 'Kharif', marketPrice: 4200 },
  'Tobacco': { yield: 1800, temp: [20, 30], humidity: [65, 85], rainfall: [500, 1000], season: 'Rabi', marketPrice: 12000 },
  
  // Oilseeds
  'Groundnut': { yield: 1400, temp: [20, 30], humidity: [50, 75], rainfall: [500, 750], season: 'Kharif', marketPrice: 5200 },
  'Mustard': { yield: 1200, temp: [10, 25], humidity: [60, 70], rainfall: [300, 600], season: 'Rabi', marketPrice: 4800 },
  'Sunflower': { yield: 1800, temp: [20, 25], humidity: [60, 70], rainfall: [400, 600], season: 'Rabi', marketPrice: 6200 },
  'Sesame': { yield: 800, temp: [25, 30], humidity: [50, 70], rainfall: [400, 600], season: 'Kharif', marketPrice: 8500 },
  'Soybean': { yield: 2500, temp: [20, 30], humidity: [60, 70], rainfall: [600, 1000], season: 'Kharif', marketPrice: 4200 },
  
  // Pulses
  'Chickpea': { yield: 1800, temp: [20, 30], humidity: [60, 70], rainfall: [300, 400], season: 'Rabi', marketPrice: 5000 },
  'Pigeon Pea': { yield: 1200, temp: [20, 30], humidity: [60, 65], rainfall: [600, 1000], season: 'Kharif', marketPrice: 7200 },
  'Black Gram': { yield: 800, temp: [25, 35], humidity: [50, 70], rainfall: [600, 1000], season: 'Kharif', marketPrice: 6800 },
  'Green Gram': { yield: 900, temp: [25, 30], humidity: [50, 70], rainfall: [600, 1000], season: 'Kharif', marketPrice: 7500 },
  'Lentil': { yield: 1000, temp: [15, 25], humidity: [50, 70], rainfall: [300, 400], season: 'Rabi', marketPrice: 6200 },
  
  // Vegetables
  'Tomato': { yield: 25000, temp: [20, 25], humidity: [60, 70], rainfall: [600, 1000], season: 'All Year', marketPrice: 2500 },
  'Onion': { yield: 12000, temp: [13, 28], humidity: [55, 75], rainfall: [400, 700], season: 'Rabi', marketPrice: 2200 },
  'Potato': { yield: 22000, temp: [15, 25], humidity: [60, 80], rainfall: [500, 700], season: 'Rabi', marketPrice: 1800 },
  'Cabbage': { yield: 30000, temp: [15, 20], humidity: [60, 90], rainfall: [600, 1000], season: 'Rabi', marketPrice: 1500 },
  'Cauliflower': { yield: 20000, temp: [15, 20], humidity: [60, 80], rainfall: [600, 1000], season: 'Rabi', marketPrice: 2000 },
  'Brinjal': { yield: 18000, temp: [22, 32], humidity: [60, 70], rainfall: [600, 1000], season: 'All Year', marketPrice: 2800 },
  'Okra': { yield: 8000, temp: [25, 35], humidity: [60, 70], rainfall: [600, 1000], season: 'Kharif', marketPrice: 3500 },
  'Carrot': { yield: 15000, temp: [16, 20], humidity: [65, 70], rainfall: [600, 1000], season: 'Rabi', marketPrice: 2500 },
  
  // Fruits
  'Banana': { yield: 40000, temp: [26, 30], humidity: [75, 85], rainfall: [1200, 2000], season: 'All Year', marketPrice: 2000 },
  'Mango': { yield: 8000, temp: [24, 27], humidity: [70, 85], rainfall: [750, 2500], season: 'Perennial', marketPrice: 4000 },
  'Apple': { yield: 12000, temp: [21, 24], humidity: [60, 70], rainfall: [1000, 1250], season: 'Perennial', marketPrice: 8000 },
  'Orange': { yield: 15000, temp: [13, 37], humidity: [55, 70], rainfall: [1000, 2000], season: 'Perennial', marketPrice: 3500 },
  'Grapes': { yield: 20000, temp: [15, 40], humidity: [60, 70], rainfall: [450, 650], season: 'Perennial', marketPrice: 6000 },
  
  // Spices
  'Turmeric': { yield: 6000, temp: [20, 30], humidity: [70, 85], rainfall: [1500, 2250], season: 'Kharif', marketPrice: 8500 },
  'Ginger': { yield: 12000, temp: [25, 30], humidity: [70, 85], rainfall: [1500, 3000], season: 'Kharif', marketPrice: 15000 },
  'Garlic': { yield: 8000, temp: [15, 25], humidity: [60, 70], rainfall: [450, 600], season: 'Rabi', marketPrice: 12000 },
  'Coriander': { yield: 1200, temp: [20, 30], humidity: [60, 70], rainfall: [600, 1000], season: 'Rabi', marketPrice: 8000 },
  'Cumin': { yield: 800, temp: [25, 30], humidity: [60, 70], rainfall: [300, 400], season: 'Rabi', marketPrice: 22000 },
  'Fenugreek': { yield: 1500, temp: [15, 25], humidity: [60, 70], rainfall: [400, 600], season: 'Rabi', marketPrice: 6500 }
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', crops: Object.keys(crops).length });
});

app.post('/api/predict', (req, res) => {
  const { temperature, humidity, rainfall, state, soilType } = req.body;
  
  const predictions = Object.entries(crops).map(([name, data]) => {
    let score = 0;
    let reasons = [];
    
    // Temperature scoring (30 points)
    const tempCenter = (data.temp[0] + data.temp[1]) / 2;
    const tempRange = data.temp[1] - data.temp[0];
    if (temperature >= data.temp[0] && temperature <= data.temp[1]) {
      const tempScore = 30 - Math.abs(temperature - tempCenter) / tempRange * 10;
      score += Math.max(20, tempScore);
      reasons.push(`Optimal temperature range (${data.temp[0]}-${data.temp[1]}°C)`);
    } else {
      const deviation = temperature < data.temp[0] ? data.temp[0] - temperature : temperature - data.temp[1];
      const penaltyScore = Math.max(0, 20 - deviation * 2);
      score += penaltyScore;
      if (penaltyScore < 15) {
        reasons.push(`Temperature ${temperature}°C is outside optimal range`);
      }
    }
    
    // Humidity scoring (25 points)
    const humidityCenter = (data.humidity[0] + data.humidity[1]) / 2;
    const humidityRange = data.humidity[1] - data.humidity[0];
    if (humidity >= data.humidity[0] && humidity <= data.humidity[1]) {
      const humidityScore = 25 - Math.abs(humidity - humidityCenter) / humidityRange * 8;
      score += Math.max(18, humidityScore);
      reasons.push(`Good humidity levels (${data.humidity[0]}-${data.humidity[1]}%)`);
    } else {
      const deviation = humidity < data.humidity[0] ? data.humidity[0] - humidity : humidity - data.humidity[1];
      const penaltyScore = Math.max(0, 18 - deviation * 0.5);
      score += penaltyScore;
      if (penaltyScore < 12) {
        reasons.push(`Humidity ${humidity}% needs adjustment`);
      }
    }
    
    // Rainfall scoring (25 points)
    const rainfallCenter = (data.rainfall[0] + data.rainfall[1]) / 2;
    const rainfallRange = data.rainfall[1] - data.rainfall[0];
    if (rainfall >= data.rainfall[0] && rainfall <= data.rainfall[1]) {
      const rainfallScore = 25 - Math.abs(rainfall - rainfallCenter) / rainfallRange * 8;
      score += Math.max(18, rainfallScore);
      reasons.push(`Adequate rainfall (${data.rainfall[0]}-${data.rainfall[1]}mm)`);
    } else {
      const deviation = rainfall < data.rainfall[0] ? data.rainfall[0] - rainfall : rainfall - data.rainfall[1];
      const penaltyScore = Math.max(0, 18 - deviation * 0.01);
      score += penaltyScore;
      if (penaltyScore < 12) {
        reasons.push(`Rainfall ${rainfall}mm may require irrigation adjustment`);
      }
    }
    
    // Soil compatibility scoring (20 points)
    if (soilType) {
      const soilScore = getSoilCompatibility(name, soilType);
      score += soilScore;
      if (soilScore > 15) {
        reasons.push(`Excellent soil compatibility with ${soilType} soil`);
      } else if (soilScore > 10) {
        reasons.push(`Good soil compatibility with ${soilType} soil`);
      } else {
        reasons.push(`${soilType} soil may need amendments for optimal growth`);
      }
    } else {
      score += 15; // Default soil score
    }
    
    // Market price bonus (bonus points based on market value)
    const priceBonus = Math.min(5, data.marketPrice / 2000);
    score += priceBonus;
    if (data.marketPrice > 5000) {
      reasons.push(`High market value crop (₹${data.marketPrice}/quintal)`);
    }
    
    const finalScore = Math.min(100, Math.max(0, score));
    const adjustedYield = data.yield * (finalScore / 100);
    
    return {
      crop: name,
      suitabilityScore: Math.round(finalScore),
      expectedYield: Math.round(adjustedYield),
      marketPrice: data.marketPrice,
      season: data.season,
      confidence: finalScore > 80 ? 'High' : finalScore > 60 ? 'Medium' : 'Low',
      reasons: reasons.slice(0, 3), // Top 3 reasons
      profitPotential: calculateProfitPotential(adjustedYield, data.marketPrice, finalScore)
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  
  res.json({
    predictions: predictions.slice(0, 10), // Return top 10 instead of 5
    conditions: { temperature, humidity, rainfall, state, soilType },
    timestamp: new Date().toISOString(),
    totalCropsAnalyzed: Object.keys(crops).length
  });
});

// Soil compatibility function
function getSoilCompatibility(crop, soilType) {
  const soilCompatibility = {
    'Rice': { 'alluvial': 20, 'black': 18, 'clay': 19, 'clayey': 17, 'loamy': 16, 'red': 14, 'sandy': 12, 'laterite': 13, 'saline': 8, 'peaty': 15, 'coastal': 16 },
    'Wheat': { 'alluvial': 18, 'black': 17, 'loamy': 20, 'clayey': 16, 'red': 16, 'sandy': 13, 'clay': 15, 'arid': 14, 'laterite': 12, 'mountainous': 15 },
    'Cotton': { 'black': 20, 'alluvial': 17, 'red': 16, 'clayey': 16, 'loamy': 15, 'sandy': 13, 'laterite': 14, 'arid': 12, 'clay': 15 },
    'Sugarcane': { 'alluvial': 20, 'black': 18, 'red': 16, 'loamy': 17, 'clayey': 16, 'sandy': 12, 'laterite': 13, 'clay': 15, 'coastal': 14 },
    'Maize': { 'alluvial': 19, 'black': 17, 'red': 16, 'loamy': 20, 'sandy': 14, 'clayey': 16, 'clay': 15, 'laterite': 13, 'mountainous': 14 },
    'Tomato': { 'loamy': 20, 'alluvial': 18, 'red': 17, 'sandy': 16, 'black': 16, 'clayey': 15, 'clay': 13, 'laterite': 14, 'volcanic': 18 },
    'Onion': { 'alluvial': 18, 'loamy': 19, 'sandy': 17, 'red': 16, 'black': 15, 'clayey': 14, 'clay': 12, 'arid': 13, 'laterite': 13 },
    'Potato': { 'loamy': 20, 'sandy': 18, 'alluvial': 17, 'red': 16, 'black': 14, 'clayey': 15, 'clay': 12, 'mountainous': 16, 'volcanic': 17 },
    'Groundnut': { 'sandy': 20, 'red': 18, 'alluvial': 16, 'laterite': 17, 'black': 15, 'loamy': 16, 'clayey': 14, 'clay': 12, 'arid': 15 },
    'Banana': { 'alluvial': 20, 'loamy': 19, 'red': 17, 'black': 16, 'clayey': 16, 'sandy': 14, 'laterite': 15, 'coastal': 18, 'volcanic': 19 }
  };
  
  const cropSoil = soilCompatibility[crop];
  if (!cropSoil) return 15; // Default score for crops not in matrix
  return cropSoil[soilType] || 12; // Default for soil types not mapped
}

// Profit potential calculation
function calculateProfitPotential(cropYield, marketPrice, suitabilityScore) {
  const grossRevenue = (cropYield * marketPrice) / 100; // Convert to per quintal
  const costFactor = suitabilityScore / 100; // Higher suitability = lower input costs
  const estimatedCosts = grossRevenue * (0.6 - costFactor * 0.2); // 40-60% cost ratio
  const netProfit = grossRevenue - estimatedCosts;
  
  if (netProfit > 50000) return 'High';
  if (netProfit > 25000) return 'Medium';
  if (netProfit > 10000) return 'Low';
  return 'Very Low';
}

const PORT = 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Simple API Server running on port ${PORT}`);
});

// Keep server alive
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close();
  process.exit(0);
});