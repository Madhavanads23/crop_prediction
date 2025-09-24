"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { query } from "../lib/database_mysql";
import type { ActionCtx } from "./_generated/server";
import mysql from 'mysql2';

// Helper function to calculate planting suitability
function calculatePlantingSuitability(cropYield: number, season: string, month: number, weather: any): number {
  let score = 50; // Base score

  // Season-based scoring
  if (season === 'kharif' && month >= 6 && month <= 8) score += 30;
  else if (season === 'rabi' && (month >= 10 || month <= 2)) score += 30;
  else if (season === 'year_round') score += 15;

  // Yield-based scoring
  if (cropYield > 1000) score += 20;
  else if (cropYield > 500) score += 10;

  // Weather-based scoring (if available)
  if (weather) {
    if (weather.avg_temperature_c >= 20 && weather.avg_temperature_c <= 30) score += 10;
    if (weather.avg_rainfall_mm >= 50 && weather.avg_rainfall_mm <= 300) score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

// Enhanced crop recommendations using PostgreSQL historical data
export const getHistoricalYieldData = action({
  args: {
    stateName: v.string(),
    districtName: v.optional(v.string()),
    cropNames: v.array(v.string()),
    yearsBack: v.optional(v.number()),
  },
  handler: async (ctx: ActionCtx, args: any) => {
    try {
      const yearsBack = args.yearsBack || 10;
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - yearsBack;

      let queryText = `
        SELECT 
          s.state_name,
          d.dist_name,
          c.crop_name,
          hcd.year,
          hcd.area_ha,
          hcd.yield_kg_per_ha,
          hcd.temperature_c,
          hcd.humidity_percent,
          hcd.rainfall_mm,
          hcd.ph,
          hcd.n_req_kg_per_ha,
          hcd.p_req_kg_per_ha,
          hcd.k_req_kg_per_ha
        FROM historical_crop_data hcd
        JOIN states s ON hcd.state_code = s.state_code
        JOIN districts d ON hcd.dist_code = d.dist_code
        JOIN crops c ON hcd.crop_id = c.crop_id
        WHERE s.state_name ILIKE $1
        AND hcd.year >= $2
        AND c.crop_name = ANY($3)
      `;

      const params = [args.stateName, startYear, args.cropNames];

      if (args.districtName) {
        queryText += ` AND d.dist_name ILIKE $4`;
        params.push(args.districtName);
      }

      queryText += ` ORDER BY hcd.year DESC, c.crop_name`;

      const result = await query(queryText, params);

      // Process and aggregate data
      const aggregatedData = result.rows.reduce((acc: any, row: any) => {
        const key = `${row.crop_name}_${row.dist_name}`;
        if (!acc[key]) {
          acc[key] = {
            cropName: row.crop_name,
            districtName: row.dist_name,
            stateName: row.state_name,
            yields: [],
            avgYield: 0,
            avgTemperature: 0,
            avgHumidity: 0,
            avgRainfall: 0,
            avgPH: 0,
            nutrientReqs: {
              nitrogen: 0,
              phosphorus: 0,
              potassium: 0,
            },
          };
        }

        acc[key].yields.push({
          year: row.year,
          yield: row.yield_kg_per_ha,
          area: row.area_ha,
        });

        return acc;
      }, {});

      // Calculate averages
      Object.values(aggregatedData).forEach((cropData: any) => {
        const yields = cropData.yields;
        cropData.avgYield = yields.reduce((sum: number, y: any) => sum + y.yield, 0) / yields.length;
        
        // Calculate trend (simple linear regression slope)
        const n = yields.length;
        const sumX = yields.reduce((sum: number, y: any, i: number) => sum + i, 0);
        const sumY = yields.reduce((sum: number, y: any) => sum + y.yield, 0);
        const sumXY = yields.reduce((sum: number, y: any, i: number) => sum + i * y.yield, 0);
        const sumX2 = yields.reduce((sum: number, y: any, i: number) => sum + i * i, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        cropData.trend = slope > 1 ? 'increasing' : slope < -1 ? 'decreasing' : 'stable';
      });

      return Object.values(aggregatedData);

    } catch (error) {
      console.error("Error fetching historical yield data:", error);
      throw new Error("Failed to fetch historical yield data");
    }
  },
});

// Get crop suitability based on soil type and historical performance
export const getCropSuitabilityML = action({
  args: {
    soilType: v.string(),
    stateName: v.string(),
    districtName: v.optional(v.string()),
    targetYield: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Get soil suitability scores
      const suitabilityQuery = `
        SELECT 
          c.crop_name,
          scs.suitability_score,
          scs.suitability_reason,
          c.crop_category,
          c.growing_season
        FROM soil_crop_suitability scs
        JOIN crops c ON scs.crop_id = c.crop_id
        WHERE scs.soil_type = $1
        ORDER BY scs.suitability_score DESC
      `;

      const suitabilityResult = await query(suitabilityQuery, [args.soilType]);

      // Get historical performance for each suitable crop
      const cropNames = suitabilityResult.rows.map((row: any) => row.crop_name);
      
      if (cropNames.length === 0) {
        return [];
      }

      const performanceQuery = `
        SELECT 
          c.crop_name,
          AVG(hcd.yield_kg_per_ha) as avg_yield,
          MAX(hcd.yield_kg_per_ha) as max_yield,
          MIN(hcd.yield_kg_per_ha) as min_yield,
          STDDEV(hcd.yield_kg_per_ha) as yield_stddev,
          COUNT(*) as data_points,
          AVG(hcd.temperature_c) as avg_temp,
          AVG(hcd.humidity_percent) as avg_humidity,
          AVG(hcd.rainfall_mm) as avg_rainfall
        FROM historical_crop_data hcd
        JOIN states s ON hcd.state_code = s.state_code
        JOIN districts d ON hcd.dist_code = d.dist_code
        JOIN crops c ON hcd.crop_id = c.crop_id
        WHERE s.state_name ILIKE $1
        AND c.crop_name = ANY($2)
        AND hcd.year >= $3
        ${args.districtName ? 'AND d.dist_name ILIKE $4' : ''}
        GROUP BY c.crop_name
      `;

      const params = [args.stateName, cropNames, new Date().getFullYear() - 15];
      if (args.districtName) {
        params.push(args.districtName);
      }

      const performanceResult = await query(performanceQuery, params);

      // Combine suitability and performance data
      const recommendations = suitabilityResult.rows.map((suitability: any) => {
        const performance = performanceResult.rows.find(
          (p: any) => p.crop_name === suitability.crop_name
        );

        let finalScore = suitability.suitability_score;
        let confidence = 0.6; // Base confidence

        if (performance) {
          // Adjust score based on historical performance
          const yieldStability = performance.yield_stddev ? 
            Math.max(0, 100 - (performance.yield_stddev / performance.avg_yield) * 100) : 50;
          
          finalScore = (finalScore * 0.6) + (yieldStability * 0.4);
          confidence = Math.min(0.95, confidence + (performance.data_points / 100));

          // If target yield specified, factor in achievability
          if (args.targetYield && performance.max_yield) {
            const achievability = Math.min(100, (performance.max_yield / args.targetYield) * 100);
            finalScore = (finalScore * 0.8) + (achievability * 0.2);
          }
        }

        return {
          cropName: suitability.crop_name,
          suitabilityScore: Math.round(finalScore),
          confidence: Math.round(confidence * 100) / 100,
          soilSuitability: suitability.suitability_score,
          reason: suitability.suitability_reason,
          category: suitability.crop_category,
          season: suitability.growing_season,
          historicalData: performance ? {
            avgYield: Math.round(performance.avg_yield),
            maxYield: Math.round(performance.max_yield),
            minYield: Math.round(performance.min_yield),
            dataPoints: performance.data_points,
            yieldStability: performance.yield_stddev ? 
              Math.round((1 - performance.yield_stddev / performance.avg_yield) * 100) : null,
          } : null,
        };
      });

      return recommendations
        .sort((a: any, b: any) => b.suitabilityScore - a.suitabilityScore)
        .slice(0, 10);

    } catch (error) {
      console.error("Error getting crop suitability:", error);
      throw new Error("Failed to get crop suitability data");
    }
  },
});

// Get weather patterns for a region
export const getWeatherPatterns = action({
  args: {
    stateName: v.string(),
    districtName: v.optional(v.string()),
    months: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    try {
      let queryText = `
        SELECT 
          wp.month,
          wp.avg_temperature_c,
          wp.avg_humidity_percent,
          wp.avg_rainfall_mm,
          wp.avg_wind_speed_m_s,
          wp.avg_solar_radiation,
          wp.min_temperature_c,
          wp.max_temperature_c,
          wp.min_rainfall_mm,
          wp.max_rainfall_mm,
          wp.years_count,
          s.state_name,
          d.dist_name
        FROM weather_patterns wp
        JOIN states s ON wp.state_code = s.state_code
        JOIN districts d ON wp.dist_code = d.dist_code
        WHERE s.state_name ILIKE $1
      `;

      const params = [args.stateName];

      if (args.districtName) {
        queryText += ` AND d.dist_name ILIKE $2`;
        params.push(args.districtName);
      }

      if (args.months && args.months.length > 0) {
        const monthParam = args.districtName ? '$3' : '$2';
        queryText += ` AND wp.month = ANY(${monthParam})`;
        params.push(`{${args.months.join(',')}}`);
      }

      queryText += ` ORDER BY wp.month`;

      const result = await query(queryText, params);

      return result.rows.map((row: any) => ({
        month: row.month,
        stateName: row.state_name,
        districtName: row.dist_name,
        temperature: {
          average: row.avg_temperature_c,
          min: row.min_temperature_c,
          max: row.max_temperature_c,
        },
        humidity: {
          average: row.avg_humidity_percent,
        },
        rainfall: {
          average: row.avg_rainfall_mm,
          min: row.min_rainfall_mm,
          max: row.max_rainfall_mm,
        },
        windSpeed: row.avg_wind_speed_m_s,
        solarRadiation: row.avg_solar_radiation,
        dataYears: row.years_count,
      }));

    } catch (error) {
      console.error("Error fetching weather patterns:", error);
      throw new Error("Failed to fetch weather patterns");
    }
  },
});

// Predict optimal planting time based on historical data
export const predictOptimalPlanting = action({
  args: {
    cropName: v.string(),
    stateName: v.string(),
    districtName: v.optional(v.string()),
    soilType: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get crop's growing season and requirements
      const cropQuery = `
        SELECT growing_season, crop_category 
        FROM crops 
        WHERE crop_name = $1
      `;
      
      const cropResult = await query(cropQuery, [args.cropName]);
      
      if (cropResult.rows.length === 0) {
        throw new Error(`Crop '${args.cropName}' not found`);
      }

      const crop = cropResult.rows[0];

      // Get historical yield data by month for this crop
      const yieldQuery = `
        SELECT 
          EXTRACT(MONTH FROM DATE(hcd.year || '-01-01')) as planting_month,
          AVG(hcd.yield_kg_per_ha) as avg_yield,
          COUNT(*) as data_points,
          AVG(hcd.temperature_c) as avg_temp,
          AVG(hcd.humidity_percent) as avg_humidity,
          AVG(hcd.rainfall_mm) as avg_rainfall
        FROM historical_crop_data hcd
        JOIN states s ON hcd.state_code = s.state_code
        JOIN districts d ON hcd.dist_code = d.dist_code
        JOIN crops c ON hcd.crop_id = c.crop_id
        WHERE c.crop_name = $1
        AND s.state_name ILIKE $2
        ${args.districtName ? 'AND d.dist_name ILIKE $3' : ''}
        GROUP BY EXTRACT(MONTH FROM DATE(hcd.year || '-01-01'))
        ORDER BY avg_yield DESC
      `;

      const params = [args.cropName, args.stateName];
      if (args.districtName) {
        params.push(args.districtName);
      }

      const yieldResult = await query(yieldQuery, params);

      // Get weather patterns for optimal months
      const weatherResult = await query(`
        SELECT * FROM weather_patterns wp
        JOIN states s ON wp.state_code = s.state_code
        ${args.districtName ? 'JOIN districts d ON wp.dist_code = d.dist_code' : ''}
        WHERE s.state_name ILIKE $1
        ${args.districtName ? 'AND d.dist_name ILIKE $2' : ''}
      `, args.districtName ? [args.stateName, args.districtName] : [args.stateName]);

      // Analyze optimal planting times
      const plantingRecommendations = yieldResult.rows.map((row: any) => {
        const monthWeather = weatherResult.rows.find((w: any) => w.month === row.planting_month);
        
        return {
          month: row.planting_month,
          monthName: new Date(2024, row.planting_month - 1, 1).toLocaleString('default', { month: 'long' }),
          avgYield: Math.round(row.avg_yield),
          dataPoints: row.data_points,
          weather: monthWeather ? {
            temperature: monthWeather.avg_temperature_c,
            humidity: monthWeather.avg_humidity_percent,
            rainfall: monthWeather.avg_rainfall_mm,
          } : null,
          suitabilityScore: calculatePlantingSuitability(
            row.avg_yield,
            crop.growing_season,
            row.planting_month,
            monthWeather
          ),
        };
      });

      return {
        cropName: args.cropName,
        cropCategory: crop.crop_category,
        growingSeason: crop.growing_season,
        recommendations: plantingRecommendations.slice(0, 6),
        bestMonth: plantingRecommendations[0] || null,
      };

    } catch (error) {
      console.error("Error predicting optimal planting time:", error);
      throw new Error("Failed to predict optimal planting time");
    }
  },
});