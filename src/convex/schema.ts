import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Soil types for crop recommendations
export const SOIL_TYPES = {
  CLAY: "clay",
  LOAM: "loam", 
  SANDY: "sandy",
  SILT: "silt",
  PEAT: "peat",
  LATERITE: "laterite",
} as const;

export const soilTypeValidator = v.union(
  v.literal(SOIL_TYPES.CLAY),
  v.literal(SOIL_TYPES.LOAM),
  v.literal(SOIL_TYPES.SANDY),
  v.literal(SOIL_TYPES.SILT),
  v.literal(SOIL_TYPES.PEAT),
  v.literal(SOIL_TYPES.LATERITE),
);

export type SoilType = Infer<typeof soilTypeValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Crop recommendations table
    recommendations: defineTable({
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
      crops: v.array(v.object({
        name: v.string(),
        suitabilityScore: v.number(),
        marketDemand: v.string(),
        priceTrend: v.string(),
        explanation: v.string(),
        icon: v.string(),
      })),
      sessionId: v.optional(v.string()),
    }).index("by_user", ["userId"])
      .index("by_session", ["sessionId"]),

    // Market data cache
    marketData: defineTable({
      crop: v.string(),
      region: v.string(),
      price: v.number(),
      demand: v.string(),
      trend: v.string(),
      lastUpdated: v.number(),
    }).index("by_crop_region", ["crop", "region"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;