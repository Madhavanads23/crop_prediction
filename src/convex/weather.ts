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
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return function() {
    hash = ((hash * 9301) + 49297) % 233280;
    return hash / 233280;
  };
}

// Holt-Winters triple exponential smoothing fallback
function holtWinters(data: number[], periods: number, alpha = 0.3, beta = 0.3, gamma = 0.3): number[] {
  if (data.length < periods * 2) return data.slice(-periods);
  
  const seasonLength = Math.min(7, Math.floor(data.length / 4)); // Weekly seasonality
  const forecast: number[] = [];
  
  // Initialize components
  let level = data[0];
  let trend = (data[seasonLength] - data[0]) / seasonLength;
  const seasonal: number[] = new Array(seasonLength).fill(0);
  
  // Initialize seasonal components
  for (let i = 0; i < seasonLength; i++) {
    seasonal[i] = data[i] - level;
  }
  
  // Apply Holt-Winters
  for (let i = 1; i < data.length; i++) {
    const seasonalIndex = i % seasonLength;
    const prevLevel = level;
    
    level = alpha * (data[i] - seasonal[seasonalIndex]) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonal[seasonalIndex] = gamma * (data[i] - level) + (1 - gamma) * seasonal[seasonalIndex];
  }
  
  // Generate forecast
  for (let i = 0; i < periods; i++) {
    const seasonalIndex = (data.length + i) % seasonLength;
    forecast.push(level + (i + 1) * trend + seasonal[seasonalIndex]);
  }
  
  return forecast;
}

// Generate synthetic historical weather data
function generateHistoricalWeather(region: string, days: number = 60): { temps: number[], rainfall: number[] } {
  const rng = seededRandom(region + "_weather");
  const temps: number[] = [];
  const rainfall: number[] = [];
  
  // Regional base parameters
  const regionParams = {
    baseTemp: region.toLowerCase().includes('punjab') ? 25 : 
              region.toLowerCase().includes('kerala') ? 28 :
              region.toLowerCase().includes('rajasthan') ? 30 : 27,
    tempVariation: 8,
    baseRainfall: region.toLowerCase().includes('kerala') ? 12 :
                  region.toLowerCase().includes('rajasthan') ? 3 : 8,
    rainfallVariation: 15
  };
  
  for (let i = 0; i < days; i++) {
    // Seasonal pattern (sinusoidal with weekly cycle)
    const seasonalTemp = Math.sin((i / 7) * 2 * Math.PI) * 3;
    const seasonalRain = Math.cos((i / 7) * 2 * Math.PI + Math.PI/4) * 5;
    
    // Add trend and noise
    const temp = regionParams.baseTemp + seasonalTemp + (rng() - 0.5) * regionParams.tempVariation;
    const rain = Math.max(0, regionParams.baseRainfall + seasonalRain + (rng() - 0.5) * regionParams.rainfallVariation);
    
    temps.push(Math.round(temp * 10) / 10);
    rainfall.push(Math.round(rain * 10) / 10);
  }
  
  return { temps, rainfall };
}

// Fit ARIMA model with grid search
function fitARIMA(data: number[], maxP = 2, maxD = 1, maxQ = 2): any {
  let bestModel = null;
  let bestAIC = Infinity;
  
  for (let p = 0; p <= maxP; p++) {
    for (let d = 0; d <= maxD; d++) {
      for (let q = 0; q <= maxQ; q++) {
        try {
          const model = new ARIMA({ p, d, q, verbose: false });
          model.train(data);
          const aic = model.aic || Infinity;
          
          if (aic < bestAIC) {
            bestAIC = aic;
            bestModel = model;
          }
        } catch (e) {
          // Skip invalid configurations
          continue;
        }
      }
    }
  }
  
  return bestModel;
}

export const predictWeather = action({
  args: {
    region: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Generate synthetic historical data
      const { temps, rainfall } = generateHistoricalWeather(args.region, 60);
      
      let tempForecast: number[];
      let rainForecast: number[];
      
      try {
        // Try ARIMA forecasting
        const tempModel = fitARIMA(temps);
        const rainModel = fitARIMA(rainfall);
        
        if (tempModel && rainModel) {
          tempForecast = tempModel.predict(7);
          rainForecast = rainModel.predict(7);
        } else {
          throw new Error("ARIMA fitting failed");
        }
      } catch (e) {
        // Fallback to Holt-Winters
        console.log("ARIMA failed, using Holt-Winters fallback");
        tempForecast = holtWinters(temps, 7);
        rainForecast = holtWinters(rainfall, 7);
      }
      
      // Ensure forecasts are valid
      tempForecast = tempForecast.map(t => Math.max(15, Math.min(45, t)));
      rainForecast = rainForecast.map(r => Math.max(0, r));
      
      // Calculate humidity using linear regression on temp and rainfall
      const humidityData: number[] = [];
      for (let i = 0; i < temps.length; i++) {
        // Humidity inversely related to temp, positively to rainfall
        const humidity = 80 - (temps[i] - 25) * 1.5 + rainfall[i] * 0.8 + (Math.random() - 0.5) * 10;
        humidityData.push(Math.max(30, Math.min(95, humidity)));
      }
      
      // Predict humidity for next day using linear regression
      const tempRainPairs = temps.slice(-14).map((t, i) => [t, rainfall[rainfall.length - 14 + i]]);
      const humidityValues = humidityData.slice(-14);
      
      let predictedHumidity = 65; // Default fallback
      try {
        const regressionData = tempRainPairs.map((pair, i) => [pair[0], pair[1], humidityValues[i]]);
        const xData = regressionData.map(d => [d[0], d[1]]);
        const yData = regressionData.map(d => d[2]);
        
        // Simple linear regression with temperature as primary predictor
        const tempHumidityPairs = temps.slice(-14).map((t, i) => [t, humidityValues[i]]);
        const regression = linearRegression(tempHumidityPairs);
        const regressionLine = linearRegressionLine(regression);
        predictedHumidity = regressionLine(tempForecast[0]);
      } catch (e) {
        // Use correlation-based prediction
        predictedHumidity = 80 - (tempForecast[0] - 25) * 1.5 + rainForecast[0] * 0.8;
      }
      
      predictedHumidity = Math.max(30, Math.min(95, Math.round(predictedHumidity)));
      
      // Build forecast array
      const forecast = tempForecast.map((temp, i) => ({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        temp: Math.round(temp * 10) / 10,
        rainfall: Math.round(rainForecast[i] * 10) / 10,
      }));
      
      return {
        temperature: Math.round(tempForecast[0] * 10) / 10,
        humidity: predictedHumidity,
        rainfall: Math.round(rainForecast[0] * 10) / 10,
        forecast,
      };
      
    } catch (error) {
      console.error("Weather prediction error:", error);
      throw new Error("Failed to predict weather data");
    }
  },
});

export const getWeatherData = action({
  args: {
    region: v.string(),
  },
  handler: async (_ctx, args) => {
    // First try: Open-Meteo (open, no API key) for real current weather + 7-day forecast
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        args.region,
      )}&count=1&language=en&format=json&country=IN`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error("Geocoding failed");
      const geoJson: any = await geoRes.json();
      const loc = geoJson?.results?.[0];
      if (loc?.latitude == null || loc?.longitude == null) throw new Error("No Indian coords");

      const lat = loc.latitude as number;
      const lon = loc.longitude as number;

      const meteoUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,precipitation` +
        `&daily=temperature_2m_min,temperature_2m_max,precipitation_sum` +
        `&timezone=auto`;
      const meteoRes = await fetch(meteoUrl);
      if (!meteoRes.ok) throw new Error("Forecast fetch failed");
      const meteoJson: any = await meteoRes.json();

      const current = meteoJson?.current ?? {};
      const daily = meteoJson?.daily ?? {};

      const temperature = Math.round((current.temperature_2m ?? 0) * 10) / 10;
      const humidity = Math.max(30, Math.min(95, Math.round(current.relative_humidity_2m ?? 65)));
      const rainfall = Math.max(0, Math.round((current.precipitation ?? 0) * 10) / 10);

      const times: Array<string> = (daily.time as Array<string>) ?? [];
      const mins: Array<number> = (daily.temperature_2m_min as Array<number>) ?? [];
      const maxs: Array<number> = (daily.temperature_2m_max as Array<number>) ?? [];
      const rains: Array<number> = (daily.precipitation_sum as Array<number>) ?? [];

      const forecast = times.slice(0, 7).map((date, i) => {
        const minT = mins[i] ?? temperature;
        const maxT = maxs[i] ?? temperature;
        const avgT = Math.round(((minT + maxT) / 2) * 10) / 10;
        const rain = Math.max(0, Math.round(((rains[i] ?? 0)) * 10) / 10);
        return { date, temp: avgT, rainfall: rain };
      });

      return {
        temperature,
        humidity,
        rainfall,
        forecast,
      };
    } catch (_e) {
      // Fallback to synthetic + ARIMA/Holt-Winters model already implemented below
      try {
        const { temps, rainfall } = generateHistoricalWeather(args.region, 60);
        
        let tempForecast: number[];
        let rainForecast: number[];
        
        try {
          // Try ARIMA forecasting
          const tempModel = fitARIMA(temps);
          const rainModel = fitARIMA(rainfall);
          
          if (tempModel && rainModel) {
            tempForecast = tempModel.predict(7);
            rainForecast = rainModel.predict(7);
          } else {
            throw new Error("ARIMA fitting failed");
          }
        } catch (e) {
          // Fallback to Holt-Winters
          console.log("ARIMA failed, using Holt-Winters fallback");
          tempForecast = holtWinters(temps, 7);
          rainForecast = holtWinters(rainfall, 7);
        }
        
        // Ensure forecasts are valid
        tempForecast = tempForecast.map((t) => Math.max(15, Math.min(45, t)));
        rainForecast = rainForecast.map((r) => Math.max(0, r));
        
        // Build synthetic humidity series and forecast next day humidity
        const humidityData: number[] = [];
        for (let i = 0; i < temps.length; i++) {
          // Humidity inversely related to temp, positively to rainfall
          const humidity =
            80 - (temps[i] - 25) * 1.5 + rainfall[i] * 0.8 + (Math.random() - 0.5) * 10;
          humidityData.push(Math.max(30, Math.min(95, humidity)));
        }
        
        let predictedHumidity = 65; // Default fallback
        try {
          const humidityValues = humidityData.slice(-14);
          const tempHumidityPairs = temps
            .slice(-14)
            .map((t, i) => [t, humidityValues[i]] as [number, number]);
          const regression = linearRegression(tempHumidityPairs);
          const regressionLine = linearRegressionLine(regression);
          predictedHumidity = regressionLine(tempForecast[0]);
        } catch (e) {
          // Correlation-based fallback
          predictedHumidity =
            80 - (tempForecast[0] - 25) * 1.5 + rainForecast[0] * 0.8;
        }
        
        predictedHumidity = Math.max(30, Math.min(95, Math.round(predictedHumidity)));
        
        // Build forecast array
        const forecast = tempForecast.map((temp, i) => ({
          date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          temp: Math.round(temp * 10) / 10,
          rainfall: Math.round(rainForecast[i] * 10) / 10,
        }));
        
        return {
          temperature: Math.round(tempForecast[0] * 10) / 10,
          humidity: predictedHumidity,
          rainfall: Math.round(rainForecast[0] * 10) / 10,
          forecast,
        };
      } catch (error) {
        console.error("Weather prediction error:", error);
        throw new Error("Failed to predict weather data");
      }
    }
  },
});