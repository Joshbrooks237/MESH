const knex = require('knex');
const mongoose = require('mongoose');
const { createClient } = require('redis');

// PostgreSQL configuration (for transactional data)
const pgConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'enterprise_storage',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 60000,
    idleTimeoutMillis: 600000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

const pgConnection = knex(pgConfig);

// MongoDB configuration (for flexible document storage)
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/enterprise_storage';

// Redis configuration (for caching and real-time features)
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
};

// Initialize connections
let redisClient;

const initializeDatabase = async () => {
  try {
    // Test PostgreSQL connection
    await pgConnection.raw('SELECT 1');
    console.log('✅ PostgreSQL connected successfully');

    // MongoDB connection
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');

    // Redis connection
    redisClient = createClient(redisConfig);
    redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
    await redisClient.connect();
    console.log('✅ Redis connected successfully');

    return { pgConnection, mongoose, redisClient };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

const closeConnections = async () => {
  try {
    await pgConnection.destroy();
    await mongoose.connection.close();
    if (redisClient) {
      await redisClient.quit();
    }
    console.log('✅ All database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

module.exports = {
  pgConnection,
  initializeDatabase,
  closeConnections,
  mongoUri,
  redisConfig,
};
