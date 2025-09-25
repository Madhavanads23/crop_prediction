// AgMarkNet API Integration Service
// Official API for Indian agricultural market data

export interface AgMarkNetPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
}

export interface MarketData {
  commodity: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  market: string;
  unit: string;
}

class AgMarkNetService {
  private baseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
  private apiKey = 'YOUR_DATA_GOV_IN_API_KEY'; // Replace with actual API key

  // Commodity mapping for standardization
  private commodityMapping: Record<string, string> = {
    'Rice': 'Rice',
    'Wheat': 'Wheat',
    'Corn': 'Maize',
    'Maize': 'Maize',
    'Cotton': 'Cotton',
    'Sugarcane': 'Sugarcane',
    'Tomato': 'Tomato',
    'Tomatoes': 'Tomato',
    'Potato': 'Potato',
    'Potatoes': 'Potato',
    'Onion': 'Onion',
    'Onions': 'Onion',
    'Soybean': 'Soybean',
    'Soybeans': 'Soybean',
    'Carrot': 'Carrot',
    'Carrots': 'Carrot'
  };

  async getMarketPrices(
    state: string, 
    district: string, 
    commodity?: string
  ): Promise<AgMarkNetPrice[]> {
    try {
      const params = new URLSearchParams({
        'api-key': this.apiKey,
        format: 'json',
        limit: '100',
        filters: JSON.stringify({
          state: state,
          district: district,
          ...(commodity && { commodity: this.commodityMapping[commodity] || commodity })
        })
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`AgMarkNet API error: ${response.status}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching AgMarkNet data:', error);
      // Return mock data for development
      return this.getMockMarketData(state, district, commodity);
    }
  }

  async getCommodityMarketData(
    crops: string[], 
    state: string, 
    district: string
  ): Promise<MarketData[]> {
    const marketData: MarketData[] = [];

    for (const crop of crops) {
      try {
        const prices = await this.getMarketPrices(state, district, crop);
        
        if (prices.length > 0) {
          // Get latest price data
          const latestPrice = prices.sort((a, b) => 
            new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime()
          )[0];

          // Calculate trend based on historical data
          const trend = this.calculatePriceTrend(prices);
          const priceChange = this.calculatePriceChange(prices);

          marketData.push({
            commodity: crop,
            currentPrice: latestPrice.modal_price,
            priceChange: priceChange.absolute,
            priceChangePercent: priceChange.percentage,
            trend,
            lastUpdated: latestPrice.arrival_date,
            market: latestPrice.market,
            unit: latestPrice.unit
          });
        } else {
          // Fallback to estimated data
          marketData.push(this.getEstimatedMarketData(crop, state, district));
        }
      } catch (error) {
        console.error(`Error getting market data for ${crop}:`, error);
        marketData.push(this.getEstimatedMarketData(crop, state, district));
      }
    }

    return marketData;
  }

  private calculatePriceTrend(prices: AgMarkNetPrice[]): 'up' | 'down' | 'stable' {
    if (prices.length < 2) return 'stable';

    const sortedPrices = prices
      .sort((a, b) => new Date(a.arrival_date).getTime() - new Date(b.arrival_date).getTime())
      .slice(-7); // Last 7 days

    if (sortedPrices.length < 2) return 'stable';

    const firstPrice = sortedPrices[0].modal_price;
    const lastPrice = sortedPrices[sortedPrices.length - 1].modal_price;
    const change = (lastPrice - firstPrice) / firstPrice * 100;

    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
  }

  private calculatePriceChange(prices: AgMarkNetPrice[]): { absolute: number; percentage: number } {
    if (prices.length < 2) return { absolute: 0, percentage: 0 };

    const sortedPrices = prices
      .sort((a, b) => new Date(a.arrival_date).getTime() - new Date(b.arrival_date).getTime())
      .slice(-2);

    const oldPrice = sortedPrices[0].modal_price;
    const newPrice = sortedPrices[sortedPrices.length - 1].modal_price;

    return {
      absolute: newPrice - oldPrice,
      percentage: ((newPrice - oldPrice) / oldPrice) * 100
    };
  }

  private getEstimatedMarketData(crop: string, state: string, district: string): MarketData {
    // Fallback estimated prices based on crop type and region
    const basePrices: Record<string, number> = {
      'Rice': 2800,
      'Wheat': 2200,
      'Corn': 1800,
      'Maize': 1800,
      'Cotton': 5500,
      'Sugarcane': 350,
      'Tomato': 3500,
      'Tomatoes': 3500,
      'Potato': 2500,
      'Potatoes': 2500,
      'Onion': 3000,
      'Onions': 3000,
      'Soybean': 4500,
      'Soybeans': 4500,
      'Carrot': 2800,
      'Carrots': 2800
    };

    const basePrice = basePrices[crop] || 2500;
    const regionalMultiplier = this.getRegionalMultiplier(state);
    const seasonalVariation = Math.random() * 0.3 - 0.15; // ±15% variation
    
    const currentPrice = basePrice * regionalMultiplier * (1 + seasonalVariation);
    const priceChange = (Math.random() - 0.5) * 200; // ±100 change
    
    return {
      commodity: crop,
      currentPrice: Math.round(currentPrice),
      priceChange: Math.round(priceChange),
      priceChangePercent: Math.round((priceChange / currentPrice) * 100 * 100) / 100,
      trend: priceChange > 10 ? 'up' : priceChange < -10 ? 'down' : 'stable',
      lastUpdated: new Date().toISOString().split('T')[0],
      market: `${district} Market`,
      unit: 'Rs/Quintal'
    };
  }

  private getRegionalMultiplier(state: string): number {
    // Regional price multipliers based on economic conditions
    const multipliers: Record<string, number> = {
      'Maharashtra': 1.1,
      'Punjab': 1.05,
      'Haryana': 1.05,
      'Uttar Pradesh': 0.95,
      'Bihar': 0.9,
      'West Bengal': 0.95,
      'Gujarat': 1.08,
      'Rajasthan': 0.98,
      'Madhya Pradesh': 0.92,
      'Karnataka': 1.02,
      'Andhra Pradesh': 1.0,
      'Tamil Nadu': 1.03,
      'Telangana': 1.0,
      'Kerala': 1.15,
      'Odisha': 0.88
    };

    return multipliers[state] || 1.0;
  }

  private getMockMarketData(state: string, district: string, commodity?: string): AgMarkNetPrice[] {
    // Mock data for development/testing
    const crops = commodity ? [commodity] : ['Rice', 'Wheat', 'Tomato', 'Onion', 'Potato'];
    const mockData: AgMarkNetPrice[] = [];

    crops.forEach(crop => {
      const basePrice = this.getEstimatedMarketData(crop, state, district).currentPrice;
      
      // Generate 7 days of mock data
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const variation = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
        const price = Math.round(basePrice * variation);
        
        mockData.push({
          state,
          district,
          market: `${district} Market`,
          commodity: crop,
          variety: 'Common',
          arrival_date: date.toISOString().split('T')[0],
          min_price: price * 0.9,
          max_price: price * 1.1,
          modal_price: price,
          unit: 'Rs/Quintal'
        });
      }
    });

    return mockData;
  }
}

export const agMarkNetService = new AgMarkNetService();