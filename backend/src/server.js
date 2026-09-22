import app from './app.js';
import { env } from './config/env.js';
import { startCleanupScheduler } from './utils/cleanup.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Ratevia backend running on port ${PORT}`);
  startCleanupScheduler();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});
