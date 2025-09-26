// Production configuration for GitHub Pages deployment
export const PRODUCTION_CONFIG = {
  // GitHub Pages deployment
  isProduction: true,
  apiBaseUrl: '', // No external API in static deployment
  
  // Mock API responses for static site
  mockData: {
    predictions: [
      {
        crop: 'Rice',
        suitabilityScore: 92,
        expectedYield: 3200,
        marketPrice: 2800,
        season: 'Kharif',
        confidence: 'High',
        reasons: ['Optimal temperature range (20-35°C)', 'Good humidity levels (70-90%)', 'Adequate rainfall (1000-2000mm)'],
        profitPotential: 'High'
      },
      {
        crop: 'Wheat',
        suitabilityScore: 88,
        expectedYield: 3800,
        marketPrice: 2200,
        season: 'Rabi',
        confidence: 'High',
        reasons: ['Suitable temperature (15-25°C)', 'Good soil compatibility', 'Market demand stable'],
        profitPotential: 'Medium'
      },
      {
        crop: 'Cotton',
        suitabilityScore: 85,
        expectedYield: 520,
        marketPrice: 6000,
        season: 'Kharif',
        confidence: 'High',
        reasons: ['Good growing conditions', 'High market price', 'Export potential'],
        profitPotential: 'High'
      },
      {
        crop: 'Tomato',
        suitabilityScore: 82,
        expectedYield: 25000,
        marketPrice: 2500,
        season: 'All Year',
        confidence: 'Medium',
        reasons: ['Moderate temperature suitable', 'Year-round cultivation', 'Local market demand'],
        profitPotential: 'Medium'
      },
      {
        crop: 'Onion',
        suitabilityScore: 78,
        expectedYield: 12000,
        marketPrice: 2200,
        season: 'Rabi',
        confidence: 'Medium',
        reasons: ['Good storage crop', 'Stable market prices', 'Long shelf life'],
        profitPotential: 'Medium'
      }
    ],
    
    weather: {
      temperature: 28,
      humidity: 75,
      rainfall: 800,
      windSpeed: 12,
      conditions: 'Partly Cloudy'
    },
    
    marketData: [
      { crop: 'Rice', price: 2800, change: '+5%', trend: 'up' },
      { crop: 'Wheat', price: 2200, change: '+2%', trend: 'up' },
      { crop: 'Cotton', price: 6000, change: '-1%', trend: 'down' },
      { crop: 'Tomato', price: 2500, change: '+8%', trend: 'up' },
      { crop: 'Onion', price: 2200, change: '+3%', trend: 'up' }
    ]
  }
};

// Static deployment message
export const DEPLOYMENT_INFO = {
  message: "🌐 This is a static demo of AgriSmart deployed on GitHub Pages",
  note: "Real-time API features are simulated with mock data for demonstration purposes",
  githubRepo: "https://github.com/Madhavanads23/crop_prediction",
  liveDemo: true
};