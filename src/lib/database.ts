import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'agrismart_db',
  user: process.env.POSTGRES_USER || 'agrismart_user',
  password: process.env.POSTGRES_PASSWORD || 'agrismart_password_2025',
  max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '60000'),
  ssl: process.env.POSTGRES_SSL === 'true' ? {
    rejectUnauthorized: false,
    cert: process.env.POSTGRES_SSL_CERT_PATH,
    key: process.env.POSTGRES_SSL_KEY_PATH,
    ca: process.env.POSTGRES_SSL_CA_PATH,
  } : false,
};

// Create connection pool
let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool events
    pool.on('connect', (client: PoolClient) => {
      console.log('🔗 Connected to PostgreSQL database');
    });

    pool.on('error', (err: Error) => {
      console.error('💥 PostgreSQL pool error:', err);
    });
  }
  
  return pool;
};

// Database connection helper
export const connectDB = async (): Promise<PoolClient> => {
  try {
    const client = await getPool().connect();
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    throw new Error('Database connection failed');
  }
};

// Query helper with error handling
export const query = async (text: string, params?: any[]): Promise<any> => {
  const client = await connectDB();
  try {
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.DB_QUERY_LOGGING === 'true') {
      console.log('🔍 Query executed:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Transaction helper
export const transaction = async (callback: (client: PoolClient) => Promise<any>): Promise<any> => {
  const client = await connectDB();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT 1 as health');
    return result.rows[0]?.health === 1;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};

// Close pool (for graceful shutdown)
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔒 PostgreSQL pool closed');
  }
};

// Database schemas and types
export interface CropYieldData {
  id: string;
  distCode: number;
  year: number;
  stateCode: number;
  cropId: number;
  areaHa: number;
  yieldKgPerHa: number;
  nReqKgPerHa: number;
  pReqKgPerHa: number;
  kReqKgPerHa: number;
  totalNKg: number;
  totalPKg: number;
  totalKKg: number;
  temperatureC: number;
  humidityPercent: number;
  ph: number;
  rainfallMm: number;
  windSpeedMs: number;
  solarRadiation: number;
  createdAt: Date;
}

export interface CropData {
  cropId: number;
  cropName: string;
  cropCategory: string;
  growingSeason: string;
}

export interface StateData {
  stateCode: number;
  stateName: string;
}

export interface DistrictData {
  distCode: number;
  stateCode: number;
  distName: string;
}

export interface WeatherPattern {
  id: number;
  stateCode: number;
  distCode: number;
  month: number;
  avgTemperatureC: number;
  avgHumidityPercent: number;
  avgRainfallMm: number;
  avgWindSpeedMs: number;
  avgSolarRadiation: number;
  minTemperatureC: number;
  maxTemperatureC: number;
  minRainfallMm: number;
  maxRainfallMm: number;
  yearsCount: number;
}

export interface SoilCropSuitability {
  soilType: string;
  cropId: number;
  suitabilityScore: number;
  suitabilityReason: string;
}

// Export database utilities
export default {
  getPool,
  connectDB,
  query,
  transaction,
  healthCheck,
  closePool,
};