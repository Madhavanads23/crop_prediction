import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MySQL database configuration
const dbConfig: mysql.PoolOptions = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  database: process.env.MYSQL_DB || 'agrismart_db',
  user: process.env.MYSQL_USER || 'agrismart_user',
  password: process.env.MYSQL_PASSWORD || 'agrismart_mysql_2025',
  connectionLimit: parseInt(process.env.MYSQL_MAX_CONNECTIONS || '20'),
  multipleStatements: true,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export const getPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('🔗 MySQL connection pool created');
  }
  return pool;
};

// Database connection helper
export const connectDB = async (): Promise<mysql.PoolConnection> => {
  try {
    const connection = await getPool().getConnection();
    return connection;
  } catch (error) {
    console.error('💥 Failed to connect to MySQL database:', error);
    throw error;
  }
};

// Execute query with connection management
export const query = async (sql: string, params: any[] = []): Promise<any> => {
  let connection: mysql.PoolConnection | null = null;
  
  try {
    connection = await connectDB();
    
    if (process.env.DB_QUERY_LOGGING === 'true') {
      console.log('🔍 Executing MySQL query:', sql);
      console.log('📋 Query parameters:', params);
    }

    const startTime = Date.now();
    const [rows] = await connection.execute(sql, params);
    const endTime = Date.now();
    
    if (process.env.DB_QUERY_LOGGING === 'true') {
      console.log(`⏱️ Query executed in ${endTime - startTime}ms`);
    }

    return { rows, rowCount: Array.isArray(rows) ? rows.length : 0 };
  } catch (error) {
    console.error('💥 MySQL query error:', error);
    console.error('🔍 Failed query:', sql);
    console.error('📋 Query parameters:', params);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Transaction helper
export const transaction = async (callback: (connection: mysql.PoolConnection) => Promise<any>): Promise<any> => {
  let connection: mysql.PoolConnection | null = null;
  
  try {
    connection = await connectDB();
    await connection.beginTransaction();
    
    const result = await callback(connection);
    
    await connection.commit();
    return result;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
        console.log('🔄 Transaction rolled back due to error');
      } catch (rollbackError) {
        console.error('💥 Error during transaction rollback:', rollbackError);
      }
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Health check function
export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT 1 as health');
    return result.rows.length > 0 && result.rows[0].health === 1;
  } catch (error) {
    console.error('💥 Database health check failed:', error);
    return false;
  }
};

// Close all connections
export const closeConnections = async (): Promise<void> => {
  try {
    if (pool) {
      await pool.end();
      pool = null;
      console.log('🔒 MySQL connection pool closed');
    }
  } catch (error) {
    console.error('💥 Error closing MySQL connections:', error);
  }
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing MySQL connections...');
  await closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing MySQL connections...');
  await closeConnections();
  process.exit(0);
});

export default {
  getPool,
  connectDB,
  query,
  transaction,
  healthCheck,
  closeConnections
};