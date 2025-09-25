// Real-time Agricultural Data Integration Service
// Combines AgMarkNet and OpenMeteo APIs for comprehensive agricultural intelligence

import { agMarkNetService, MarketData } from './agmarknet';
import { openMeteoService, AgriculturalWeatherData } from './openmeteo';

export interface RealTimeAgriculturalData {
  location: {
    state: string;
    district: string;
  };
  weather: AgriculturalWeatherData;
  marketData: MarketData[];
  insights: {
    weatherSuitability: 'excellent' | 'good' | 'fair' | 'poor';
    marketOutlook: 'bullish' | 'neutral' | 'bearish';
    recommendations: string[];
  };
  lastUpdated: string;
}

export interface CropAnalysis {
  crop: string;
  suitabilityScore: number;
  marketScore: number;
  weatherScore: number;
  overallScore: number;
  recommendation: 'highly_recommended' | 'recommended' | 'neutral' | 'not_recommended';
  reasons: string[];
}

class RealTimeAgriculturalService {
  async getComprehensiveData(
    state: string,
    district: string,
    crops: string[] = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Onion', 'Potato', 'Groundnut', 'Soybean', 'Chickpea', 'Sunflower', 'Turmeric', 'Banana', 'Mango']
  ): Promise<RealTimeAgriculturalData> {
    try {
      console.log(`Fetching real-time data for ${district}, ${state}`);
      
      // Fetch weather and market data in parallel
      const [weatherData, marketData] = await Promise.all([
        openMeteoService.getAgriculturalWeatherData(district, state),
        agMarkNetService.getCommodityMarketData(crops, state, district)
      ]);

      // Generate insights
      const insights = this.generateInsights(weatherData, marketData);

      return {
        location: { state, district },
        weather: weatherData,
        marketData,
        insights,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching comprehensive agricultural data:', error);
      throw new Error('Failed to fetch real-time agricultural data');
    }
  }

  async analyzeCrops(
    state: string,
    district: string,
    crops: string[],
    soilType?: string
  ): Promise<CropAnalysis[]> {
    try {
      const data = await this.getComprehensiveData(state, district, crops);
      
      return crops.map(crop => this.analyzeCrop(crop, data, soilType));
    } catch (error) {
      console.error('Error analyzing crops:', error);
      throw new Error('Failed to analyze crops');
    }
  }

  private analyzeCrop(
    crop: string, 
    data: RealTimeAgriculturalData, 
    soilType?: string
  ): CropAnalysis {
    // Weather suitability analysis
    const weatherScore = this.calculateWeatherScore(crop, data.weather);
    
    // Market analysis
    const marketInfo = data.marketData.find(m => m.commodity === crop);
    const marketScore = this.calculateMarketScore(marketInfo);
    
    // Soil suitability (if provided)
    const soilScore = soilType ? this.calculateSoilScore(crop, soilType) : 75;
    
    // Overall score calculation
    const overallScore = Math.round(
      (weatherScore * 0.4 + marketScore * 0.4 + soilScore * 0.2)
    );
    
    // Generate recommendation
    const recommendation = this.getRecommendation(overallScore);
    
    // Generate reasons
    const reasons = this.generateReasons(crop, weatherScore, marketScore, soilScore, marketInfo);

    return {
      crop,
      suitabilityScore: overallScore,
      marketScore,
      weatherScore,
      overallScore,
      recommendation,
      reasons
    };
  }

  private calculateWeatherScore(crop: string, weather: AgriculturalWeatherData): number {
    const current = weather.current;
    const forecast = weather.forecast;
    
    // Crop-specific optimal conditions
    const optimalConditions: Record<string, {
      tempRange: [number, number];
      humidityRange: [number, number];
      rainfallRange: [number, number];
    }> = {
      'Rice': { tempRange: [20, 35], humidityRange: [70, 90], rainfallRange: [100, 200] },
      'Wheat': { tempRange: [15, 25], humidityRange: [50, 70], rainfallRange: [50, 100] },
      'Cotton': { tempRange: [21, 30], humidityRange: [50, 80], rainfallRange: [60, 120] },
      'Tomato': { tempRange: [18, 29], humidityRange: [60, 80], rainfallRange: [30, 80] },
      'Onion': { tempRange: [13, 28], humidityRange: [55, 75], rainfallRange: [40, 100] },
      'Potato': { tempRange: [15, 25], humidityRange: [60, 85], rainfallRange: [50, 120] },
      'Corn': { tempRange: [21, 30], humidityRange: [50, 70], rainfallRange: [60, 120] },
      'Soybean': { tempRange: [20, 30], humidityRange: [60, 80], rainfallRange: [80, 140] }
    };

    const optimal = optimalConditions[crop] || optimalConditions['Rice'];
    
    // Calculate temperature score
    const tempScore = this.calculateRangeScore(
      current.temperature, 
      optimal.tempRange[0], 
      optimal.tempRange[1]
    );
    
    // Calculate humidity score
    const humidityScore = this.calculateRangeScore(
      current.humidity, 
      optimal.humidityRange[0], 
      optimal.humidityRange[1]
    );
    
    // Calculate rainfall score (7-day forecast)
    const totalRainfall = forecast.slice(0, 7).reduce((sum, day) => sum + day.rainfall, 0);
    const rainfallScore = this.calculateRangeScore(
      totalRainfall, 
      optimal.rainfallRange[0], 
      optimal.rainfallRange[1]
    );
    
    // Weight the scores
    return Math.round(
      tempScore * 0.4 + humidityScore * 0.3 + rainfallScore * 0.3
    );
  }

  private calculateMarketScore(marketInfo?: MarketData): number {
    if (!marketInfo) return 50; // Neutral score if no market data
    
    let score = 50; // Base score
    
    // Price trend impact
    if (marketInfo.trend === 'up') score += 20;
    else if (marketInfo.trend === 'down') score -= 20;
    
    // Price change impact
    if (marketInfo.priceChangePercent > 5) score += 15;
    else if (marketInfo.priceChangePercent < -5) score -= 15;
    else if (Math.abs(marketInfo.priceChangePercent) <= 2) score += 5; // Stability bonus
    
    // Price level assessment (assuming higher prices are better for farmers)
    if (marketInfo.currentPrice > 3000) score += 10;
    else if (marketInfo.currentPrice < 2000) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateSoilScore(crop: string, soilType: string): number {
    // Comprehensive crop-soil compatibility matrix
    const soilCompatibility: Record<string, Record<string, number>> = {
      'Rice': {
        'alluvial': 95, 'black': 85, 'clay': 90, 'clayey': 85, 'loamy': 80, 'red': 70, 'sandy': 60, 
        'laterite': 65, 'saline': 40, 'peaty': 75, 'coastal': 80, 'volcanic': 85, 'mountainous': 60, 'forest': 70, 'arid': 30
      },
      'Wheat': {
        'alluvial': 85, 'black': 85, 'clay': 70, 'clayey': 75, 'loamy': 90, 'red': 80, 'sandy': 65,
        'laterite': 60, 'saline': 35, 'peaty': 65, 'coastal': 70, 'volcanic': 80, 'mountainous': 75, 'forest': 70, 'arid': 70
      },
      'Cotton': {
        'alluvial': 80, 'black': 95, 'clay': 75, 'clayey': 80, 'loamy': 85, 'red': 75, 'sandy': 70,
        'laterite': 70, 'saline': 40, 'peaty': 60, 'coastal': 65, 'volcanic': 80, 'mountainous': 65, 'forest': 70, 'arid': 60
      },
      'Maize': {
        'alluvial': 90, 'black': 85, 'clay': 75, 'clayey': 80, 'loamy': 95, 'red': 80, 'sandy': 70,
        'laterite': 65, 'saline': 30, 'peaty': 70, 'coastal': 75, 'volcanic': 90, 'mountainous': 70, 'forest': 75, 'arid': 50
      },
      'Tomato': {
        'alluvial': 85, 'black': 80, 'clay': 65, 'clayey': 70, 'loamy': 90, 'red': 85, 'sandy': 85,
        'laterite': 70, 'saline': 25, 'peaty': 75, 'coastal': 70, 'volcanic': 90, 'mountainous': 75, 'forest': 80, 'arid': 40
      },
      'Onion': {
        'alluvial': 85, 'black': 75, 'clay': 60, 'clayey': 70, 'loamy': 90, 'red': 80, 'sandy': 85,
        'laterite': 65, 'saline': 20, 'peaty': 65, 'coastal': 70, 'volcanic': 85, 'mountainous': 70, 'forest': 75, 'arid': 65
      },
      'Potato': {
        'alluvial': 85, 'black': 70, 'clay': 60, 'clayey': 75, 'loamy': 95, 'red': 80, 'sandy': 90,
        'laterite': 70, 'saline': 15, 'peaty': 80, 'coastal': 65, 'volcanic': 85, 'mountainous': 80, 'forest': 75, 'arid': 45
      },
      'Sugarcane': {
        'alluvial': 95, 'black': 90, 'clay': 75, 'clayey': 80, 'loamy': 85, 'red': 80, 'sandy': 60,
        'laterite': 65, 'saline': 30, 'peaty': 70, 'coastal': 70, 'volcanic': 85, 'mountainous': 60, 'forest': 75, 'arid': 25
      },
      'Groundnut': {
        'alluvial': 80, 'black': 75, 'clay': 60, 'clayey': 70, 'loamy': 80, 'red': 90, 'sandy': 95,
        'laterite': 85, 'saline': 35, 'peaty': 60, 'coastal': 80, 'volcanic': 75, 'mountainous': 65, 'forest': 70, 'arid': 75
      },
      'Banana': {
        'alluvial': 95, 'black': 80, 'clay': 70, 'clayey': 80, 'loamy': 90, 'red': 85, 'sandy': 70,
        'laterite': 75, 'saline': 20, 'peaty': 85, 'coastal': 90, 'volcanic': 95, 'mountainous': 70, 'forest': 85, 'arid': 15
      },
      'Chickpea': {
        'alluvial': 85, 'black': 90, 'clay': 70, 'clayey': 80, 'loamy': 90, 'red': 85, 'sandy': 75,
        'laterite': 70, 'saline': 25, 'peaty': 65, 'coastal': 70, 'volcanic': 80, 'mountainous': 75, 'forest': 70, 'arid': 80
      },
      'Sunflower': {
        'alluvial': 80, 'black': 85, 'clay': 70, 'clayey': 75, 'loamy': 85, 'red': 80, 'sandy': 80,
        'laterite': 75, 'saline': 40, 'peaty': 60, 'coastal': 75, 'volcanic': 85, 'mountainous': 70, 'forest': 75, 'arid': 70
      },
      'Turmeric': {
        'alluvial': 90, 'black': 85, 'clay': 75, 'clayey': 80, 'loamy': 85, 'red': 90, 'sandy': 65,
        'laterite': 80, 'saline': 20, 'peaty': 75, 'coastal': 75, 'volcanic': 90, 'mountainous': 75, 'forest': 85, 'arid': 30
      }
    };

    const cropCompatibility = soilCompatibility[crop];
    if (!cropCompatibility) return 75; // Default score for unmapped crops

    return cropCompatibility[soilType] || 75; // Default for unmapped soil types
  }

  private calculateRangeScore(value: number, min: number, max: number): number {
    if (value >= min && value <= max) {
      // In optimal range
      const center = (min + max) / 2;
      const distance = Math.abs(value - center);
      const maxDistance = (max - min) / 2;
      return Math.round(100 - (distance / maxDistance) * 20); // 80-100 range
    } else {
      // Outside optimal range
      const deviation = value < min ? min - value : value - max;
      const tolerance = (max - min) * 0.5; // 50% tolerance
      const score = Math.max(0, 80 - (deviation / tolerance) * 80);
      return Math.round(score);
    }
  }

  private getRecommendation(score: number): 'highly_recommended' | 'recommended' | 'neutral' | 'not_recommended' {
    if (score >= 80) return 'highly_recommended';
    if (score >= 65) return 'recommended';
    if (score >= 45) return 'neutral';
    return 'not_recommended';
  }

  private generateReasons(
    crop: string,
    weatherScore: number,
    marketScore: number,
    soilScore: number,
    marketInfo?: MarketData
  ): string[] {
    const reasons: string[] = [];
    
    // Weather reasons
    if (weatherScore >= 80) {
      reasons.push('Excellent weather conditions for crop growth');
    } else if (weatherScore >= 65) {
      reasons.push('Good weather conditions with minor adjustments needed');
    } else if (weatherScore < 50) {
      reasons.push('Weather conditions may be challenging for optimal growth');
    }
    
    // Market reasons
    if (marketInfo) {
      if (marketScore >= 80) {
        reasons.push(`Strong market demand with ${marketInfo.trend}ing price trend`);
      } else if (marketScore >= 65) {
        reasons.push(`Stable market conditions with current price ₹${marketInfo.currentPrice}/quintal`);
      } else {
        reasons.push(`Market conditions showing ${marketInfo.trend}ing trend, monitor prices`);
      }
      
      if (Math.abs(marketInfo.priceChangePercent) > 10) {
        reasons.push(`Significant price volatility detected (${marketInfo.priceChangePercent.toFixed(1)}% change)`);
      }
    }
    
    // Soil reasons
    if (soilScore >= 80) {
      reasons.push('Soil type is well-suited for this crop');
    } else if (soilScore < 60) {
      reasons.push('Soil type may require amendments for optimal yield');
    }
    
    return reasons;
  }

  private generateInsights(
    weather: AgriculturalWeatherData,
    marketData: MarketData[]
  ): {
    weatherSuitability: 'excellent' | 'good' | 'fair' | 'poor';
    marketOutlook: 'bullish' | 'neutral' | 'bearish';
    recommendations: string[];
  } {
    // Weather suitability assessment
    const avgTemp = weather.current.temperature;
    const humidity = weather.current.humidity;
    const totalRainfall = weather.forecast.slice(0, 7).reduce((sum, day) => sum + day.rainfall, 0);
    
    let weatherSuitability: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
    
    if (avgTemp >= 20 && avgTemp <= 30 && humidity >= 50 && humidity <= 80 && totalRainfall >= 20 && totalRainfall <= 100) {
      weatherSuitability = 'excellent';
    } else if (avgTemp >= 15 && avgTemp <= 35 && humidity >= 40 && humidity <= 85) {
      weatherSuitability = 'good';
    } else if (avgTemp < 10 || avgTemp > 40 || humidity < 30 || humidity > 90) {
      weatherSuitability = 'poor';
    }
    
    // Market outlook assessment
    const upTrends = marketData.filter(m => m.trend === 'up').length;
    const downTrends = marketData.filter(m => m.trend === 'down').length;
    const avgPriceChange = marketData.reduce((sum, m) => sum + m.priceChangePercent, 0) / marketData.length;
    
    let marketOutlook: 'bullish' | 'neutral' | 'bearish' = 'neutral';
    
    if (upTrends > downTrends && avgPriceChange > 2) {
      marketOutlook = 'bullish';
    } else if (downTrends > upTrends && avgPriceChange < -2) {
      marketOutlook = 'bearish';
    }
    
    // Generate recommendations
    const recommendations: string[] = [
      ...weather.recommendations,
      `Current weather is ${weatherSuitability} for agricultural activities`,
      `Market outlook is ${marketOutlook} with average price change of ${avgPriceChange.toFixed(1)}%`
    ];
    
    if (totalRainfall < 10) {
      recommendations.push('Consider drought-resistant crop varieties due to low rainfall forecast');
    }
    
    if (marketOutlook === 'bullish') {
      recommendations.push('Consider increasing cultivation area for high-demand crops');
    }
    
    return {
      weatherSuitability,
      marketOutlook,
      recommendations
    };
  }
}

export const realTimeAgriculturalService = new RealTimeAgriculturalService();