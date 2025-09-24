import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { soilTypeValidator } from "./schema";

// Crop suitability database
const CROP_SUITABILITY = {
  clay: {
    "Rice": { score: 95, reason: "Excellent water retention for paddy cultivation" },
    "Wheat": { score: 75, reason: "Good drainage needed, moderate suitability" },
    "Sugarcane": { score: 85, reason: "High water retention beneficial" },
    "Cotton": { score: 70, reason: "Requires good drainage management" },
    "Soybeans": { score: 65, reason: "May face waterlogging issues" },
  },
  loam: {
    "Tomatoes": { score: 95, reason: "Perfect balance of drainage and nutrients" },
    "Corn": { score: 90, reason: "Excellent nutrient retention and drainage" },
    "Wheat": { score: 88, reason: "Ideal soil structure for root development" },
    "Soybeans": { score: 85, reason: "Good nitrogen fixation environment" },
    "Potatoes": { score: 82, reason: "Good drainage prevents tuber rot" },
  },
  sandy: {
    "Carrots": { score: 92, reason: "Excellent drainage for root vegetables" },
    "Potatoes": { score: 88, reason: "Good drainage prevents diseases" },
    "Onions": { score: 85, reason: "Well-draining soil prevents bulb rot" },
    "Cotton": { score: 80, reason: "Good drainage, may need irrigation" },
    "Corn": { score: 70, reason: "Requires frequent watering and fertilization" },
  },
  silt: {
    "Rice": { score: 85, reason: "Good water retention for paddy fields" },
    "Wheat": { score: 80, reason: "Good nutrient retention" },
    "Soybeans": { score: 78, reason: "Adequate drainage and nutrients" },
    "Sugarcane": { score: 75, reason: "Good moisture retention" },
    "Corn": { score: 72, reason: "May need drainage improvement" },
  },
  peat: {
    "Rice": { score: 90, reason: "Excellent organic matter and water retention" },
    "Sugarcane": { score: 85, reason: "High organic content beneficial" },
    "Tomatoes": { score: 75, reason: "Rich in nutrients but may need pH adjustment" },
    "Potatoes": { score: 70, reason: "Good organic matter, watch pH levels" },
    "Carrots": { score: 68, reason: "Rich soil but may be too acidic" },
  },
  laterite: {
    "Cotton": { score: 80, reason: "Good drainage, iron-rich soil" },
    "Sugarcane": { score: 75, reason: "Adequate with proper fertilization" },
    "Corn": { score: 70, reason: "Requires soil amendments and fertilizers" },
    "Rice": { score: 65, reason: "May need soil improvement for better yields" },
    "Soybeans": { score: 60, reason: "Challenging but possible with amendments" },
  },
};

export const generateRecommendations = mutation({
  args: {
    userId: v.optional(v.id("users")),
    region: v.string(),
    soilType: soilTypeValidator,
    weatherData: v.object({
      temperature: v.number(),
      humidity: v.number(),
      rainfall: v.number(),
      forecast: v.array(v.object({
        date: v.string(),
        temp: v.number(),
        rainfall: v.number(),
      })),
    }),
    marketData: v.array(v.object({
      crop: v.string(),
      price: v.number(),
      demand: v.string(),
      trend: v.string(),
      region: v.string(),
    })),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const suitabilityData = CROP_SUITABILITY[args.soilType] || CROP_SUITABILITY.loam;
    
    // Generate crop recommendations
    const crops = Object.entries(suitabilityData).map(([cropName, suitability]) => {
      const marketInfo = args.marketData.find(m => m.crop === cropName) || {
        demand: "medium",
        trend: "stable",
      };
      
      // Calculate final suitability score based on soil, weather, and market factors
      let finalScore = suitability.score;
      
      // Weather adjustments
      if (args.weatherData.temperature > 30 && ["Rice", "Sugarcane", "Cotton"].includes(cropName)) {
        finalScore += 5; // Heat-loving crops
      }
      if (args.weatherData.rainfall > 100 && ["Rice", "Sugarcane"].includes(cropName)) {
        finalScore += 5; // Water-loving crops
      }
      
      // Market demand adjustments
      if (marketInfo.demand === "high") finalScore += 10;
      if (marketInfo.demand === "low") finalScore -= 5;
      if (marketInfo.trend === "increasing") finalScore += 5;
      if (marketInfo.trend === "decreasing") finalScore -= 5;
      
      finalScore = Math.min(100, Math.max(0, finalScore));
      
      return {
        name: cropName,
        suitabilityScore: finalScore,
        marketDemand: marketInfo.demand || "medium",
        priceTrend: marketInfo.trend || "stable",
        explanation: suitability.reason,
        icon: getCropIcon(cropName),
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, 5);

    // Store recommendation
    const recommendationId = await ctx.db.insert("recommendations", {
      userId: args.userId,
      region: args.region,
      soilType: args.soilType,
      weatherData: args.weatherData,
      crops,
      sessionId: args.sessionId,
    });

    return { recommendationId, crops };
  },
});

export const getUserRecommendations = query({
  args: {
    userId: v.optional(v.id("users")),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("recommendations")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(10);
    } else if (args.sessionId) {
      return await ctx.db
        .query("recommendations")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .order("desc")
        .take(10);
    }
    return [];
  },
});

function getCropIcon(cropName: string): string {
  const icons: Record<string, string> = {
    "Rice": "🌾",
    "Wheat": "🌾", 
    "Corn": "🌽",
    "Soybeans": "🫘",
    "Cotton": "🌿",
    "Sugarcane": "🎋",
    "Tomatoes": "🍅",
    "Potatoes": "🥔",
    "Onions": "🧅",
    "Carrots": "🥕",
  };
  return icons[cropName] || "🌱";
}
