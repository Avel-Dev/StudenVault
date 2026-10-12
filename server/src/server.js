require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const { seedData } = require('./utils/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed in development if database has no users
    if (process.env.NODE_ENV !== 'production') {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[StudyVault Server] Database is empty. Auto-seeding initial academic data...');
        await seedData();
      }
    }

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`[StudyVault Server] Running on http://localhost:${PORT}`);
      console.log(`[StudyVault Server] API endpoints available at http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[StudyVault Server] SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('[StudyVault Server] HTTP server closed');
      });
    });
  } catch (err) {
    console.error('[StudyVault Server] Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();
