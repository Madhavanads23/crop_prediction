"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
// @ts-ignore
import ARIMA from "arima";
import { linearRegression, linearRegressionLine } from "simple-statistics";
 // Removed api import to avoid circular type inference

// Seeded random number generator for deterministic results
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return function() {
    hash = ((hash * 9301) + 49297) % 233280;
    return hash / 233280;
  };
}

// Holt-Winters fallback for market forecasting
function holtWintersMarket(data: number[], periods: number): number[] {
  if (data.length < 14) return data.slice(-periods);
  
  const alpha = 0.3, beta = 0.3, gamma = 0.3;
  const seasonLength = 7; // Weekly seasonality
  const forecast: number[] = [];
  
  let level = data[0];
  let trend = (data[6] - data[0]) / 6;
  const seasonal: number[] = new Array(seasonLength).fill(0);
  
  for (let i = 0; i < seasonLength && i < data.length; i++) {
    seasonal[i] = data[i] - level;
  }
  
  for (let i = 1; i < data.length; i++) {
    const seasonalIndex = i % seasonLength;
    const prevLevel = level;
    
    level = alpha * (data[i] - seasonal[seasonalIndex]) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonal[seasonalIndex] = gamma * (data[i] - level) + (1 - gamma) * seasonal[seasonalIndex];
  }
  
  for (let i = 0; i < periods; i++) {
    const seasonalIndex = (data.length + i) % seasonLength;
    forecast.push(level + (i + 1) * trend + seasonal[seasonalIndex]);
  }
  
  return forecast;
}

// Generate synthetic market history for a crop
function generateMarketHistory(crop: string, region: string, days: number = 90): { demandIndex: number[], prices: number[] } {
  const rng = seededRandom(crop + region + "_market");
  const demandIndex: number[] = [];
  const prices: number[] = [];
  
  // Crop-specific parameters
  const cropParams: Record<string, any> = {
    "Rice": { baseDemand: 75, demandVolatility: 15, basePrice: 45, priceVolatility: 8, seasonality: 0.8 },
    "Wheat": { baseDemand: 70, demandVolatility: 12, basePrice: 38, priceVolatility: 6, seasonality: 0.6 },
    "Corn": { baseDemand: 65, demandVolatility: 18, basePrice: 32, priceVolatility: 10, seasonality: 1.0 },
    "Soybeans": { baseDemand: 60, demandVolatility: 20, basePrice: 55, priceVolatility: 12, seasonality: 0.7 },
    "Cotton": { baseDemand: 55, demandVolatility: 25, basePrice: 78, priceVolatility: 15, seasonality: 0.9 },
    "Sugarcane": { baseDemand: 68, demandVolatility: 14, basePrice: 28, priceVolatility: 5, seasonality: 0.5 },
    "Tomatoes": { baseDemand: 80, demandVolatility: 22, basePrice: 65, priceVolatility: 18, seasonality: 1.2 },
    "Potatoes": { baseDemand: 72, demandVolatility: 16, basePrice: 42, priceVolatility: 12, seasonality: 0.8 },
    "Onions": { baseDemand: 78, demandVolatility: 20, basePrice: 48, priceVolatility: 14, seasonality: 1.1 },
    "Carrots": { baseDemand: 62, demandVolatility: 18, basePrice: 52, priceVolatility: 10, seasonality: 0.9 },
  };
  
  const params = cropParams[crop] || cropParams["Rice"];
  
  for (let i = 0; i < days; i++) {
    // Seasonal pattern with trend
    const seasonalDemand = Math.sin((i / 30) * 2 * Math.PI) * params.seasonality * 10;
    const seasonalPrice = Math.cos((i / 30) * 2 * Math.PI + Math.PI/3) * params.seasonality * 5;
    
    // Add trend (slight upward for demand, variable for price)
    const demandTrend = i * 0.1;
    const priceTrend = i * 0.05 * (rng() > 0.5 ? 1 : -1);
    
    // Generate demand index (0-100)
    const demand = params.baseDemand + seasonalDemand + demandTrend + (rng() - 0.5) * params.demandVolatility;
    demandIndex.push(Math.max(10, Math.min(100, demand)));
    
    // Generate price (correlated with demand but with own volatility)
    const priceFromDemand = params.basePrice * (demand / params.baseDemand);
    const price = priceFromDemand + seasonalPrice + priceTrend + (rng() - 0.5) * params.priceVolatility;
    prices.push(Math.max(params.basePrice * 0.5, price));
  }
  
  return { demandIndex, prices };
}

// Fit ARIMA for market data
function fitMarketARIMA(data: number[]): any {
  let bestModel = null;
  let bestAIC = Infinity;
  
  // Smaller grid search for performance
  for (let p = 0; p <= 1; p++) {
    for (let d = 0; d <= 1; d++) {
      for (let q = 0; q <= 1; q++) {
        try {
          const model = new ARIMA({ p, d, q, verbose: false });
          model.train(data);
          const aic = model.aic || Infinity;
          
          if (aic < bestAIC) {
            bestAIC = aic;
            bestModel = model;
          }
        } catch (e) {
          continue;
        }
      }
    }
  }
  
  return bestModel;
}

export const predictMarketDemand = action({
  args: {
    crops: v.array(v.string()),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const results = [];
      
      for (const crop of args.crops) {
        // Generate historical data
        const { demandIndex, prices } = generateMarketHistory(crop, args.region, 90);
        
        let demandForecast: number[];
        let priceForecast: number[];
        
        try {
          // Try ARIMA forecasting
          const demandModel = fitMarketARIMA(demandIndex);
          const priceModel = fitMarketARIMA(prices);
          
          if (demandModel && priceModel) {
            demandForecast = demandModel.predict(14);
            priceForecast = priceModel.predict(14);
          } else {
            throw new Error("ARIMA fitting failed");
          }
        } catch (e) {
          // Fallback to Holt-Winters
          console.log(`ARIMA failed for ${crop}, using Holt-Winters fallback`);
          demandForecast = holtWintersMarket(demandIndex, 14);
          priceForecast = holtWintersMarket(prices, 14);
        }
        
        // Use day 7 as representative forecast
        const forecastDemand = Math.max(0, Math.min(100, demandForecast[6] || demandIndex[demandIndex.length - 1]));
        const forecastPrice = Math.max(0, priceForecast[6] || prices[prices.length - 1]);
        
        // Categorize demand
        let demandCategory: string;
        if (forecastDemand >= 66) demandCategory = "high";
        else if (forecastDemand >= 33) demandCategory = "medium";
        else demandCategory = "low";
        
        // Calculate price trend using linear regression on 14-day forecast
        let priceTrend = "stable";
        try {
          const trendData = priceForecast.slice(0, 14).map((price, i) => [i, price]);
          const regression = linearRegression(trendData);
          const slope = regression.m;
          
          if (slope > 0.5) priceTrend = "increasing";
          else if (slope < -0.5) priceTrend = "decreasing";
          else priceTrend = "stable";
        } catch (e) {
          // Fallback: compare first and last forecast values
          const firstPrice = priceForecast[0];
          const lastPrice = priceForecast[priceForecast.length - 1];
          const change = ((lastPrice - firstPrice) / firstPrice) * 100;
          
          if (change > 5) priceTrend = "increasing";
          else if (change < -5) priceTrend = "decreasing";
          else priceTrend = "stable";
        }
        
        results.push({
          crop,
          price: Math.round(forecastPrice * 100) / 100,
          demand: demandCategory,
          trend: priceTrend,
          region: args.region,
        });
      }
      
      return results;
      
    } catch (error) {
      console.error("Market prediction error:", error);
      throw new Error("Failed to predict market data");
    }
  },
});

export const getMarketData = action({
  args: {
    crops: v.array(v.string()),
    region: v.string(),
  },
  handler: async (_ctx, args) => {
    // Directly compute prediction to avoid circular type refs
    try {
      const results: Array<{
        crop: string;
        price: number;
        demand: string;
        trend: string;
        region: string;
      }> = [];
      
      for (const crop of args.crops) {
        // Generate historical data
        const { demandIndex, prices } = generateMarketHistory(crop, args.region, 90);
        
        let demandForecast: number[];
        let priceForecast: number[];
        
        try {
          // Try ARIMA forecasting
          const demandModel = fitMarketARIMA(demandIndex);
          const priceModel = fitMarketARIMA(prices);
          
          if (demandModel && priceModel) {
            demandForecast = demandModel.predict(14);
            priceForecast = priceModel.predict(14);
          } else {
            throw new Error("ARIMA fitting failed");
          }
        } catch (e) {
          // Fallback to Holt-Winters
          console.log(`ARIMA failed for ${crop}, using Holt-Winters fallback`);
          demandForecast = holtWintersMarket(demandIndex, 14);
          priceForecast = holtWintersMarket(prices, 14);
        }
        
        // Use day 7 as representative forecast
        const forecastDemand = Math.max(
          0,
          Math.min(100, demandForecast[6] || demandIndex[demandIndex.length - 1]),
        );
        const forecastPrice = Math.max(
          0,
          priceForecast[6] || prices[prices.length - 1],
        );
        
        // Categorize demand
        let demandCategory: string;
        if (forecastDemand >= 66) demandCategory = "high";
        else if (forecastDemand >= 33) demandCategory = "medium";
        else demandCategory = "low";
        
        // Calculate price trend using linear regression on 14-day forecast
        let priceTrend = "stable";
        try {
          const trendData = priceForecast.slice(0, 14).map((price, i) => [i, price] as [number, number]);
          const regression = linearRegression(trendData);
          // @ts-ignore slope property m from simple-statistics regression
          const slope = regression.m as number;
          
          if (slope > 0.5) priceTrend = "increasing";
          else if (slope < -0.5) priceTrend = "decreasing";
          else priceTrend = "stable";
        } catch (e) {
          // Fallback: compare first and last forecast values
          const firstPrice = priceForecast[0];
          const lastPrice = priceForecast[priceForecast.length - 1];
          const change = ((lastPrice - firstPrice) / firstPrice) * 100;
          
          if (change > 5) priceTrend = "increasing";
          else if (change < -5) priceTrend = "decreasing";
          else priceTrend = "stable";
        }
        
        results.push({
          crop,
          price: Math.round(forecastPrice * 100) / 100,
          demand: demandCategory,
          trend: priceTrend,
          region: args.region,
        });
      }
      
      return results;
    } catch (error) {
      console.error("Market prediction error:", error);
      throw new Error("Failed to predict market data");
    }
  },
});