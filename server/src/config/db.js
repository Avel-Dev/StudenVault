const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[MongoDB] Error connecting to provided MONGODB_URI: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        throw err;
      }
      console.log('[MongoDB] Falling back to in-memory MongoDB for local development...');
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      console.warn('\n================================================================================');
      console.warn('[WARNING] Running with in-memory MongoDB (MongoMemoryServer).');
      console.warn('[WARNING] Data will NOT persist across server restarts!');
      console.warn('[WARNING] Set MONGODB_URI in server/.env to use persistent MongoDB Atlas or local Mongo.');
      console.warn('================================================================================\n');

      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] In-memory database connected at ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] Failed to start MongoMemoryServer:', memErr.message);
      throw memErr;
    }
  } else {
    throw new Error('MONGODB_URI must be set in production environment.');
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
