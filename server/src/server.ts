import { app } from './app';
import { config } from './config';
import { checkDatabaseStatus } from './utils/db';

const startServer = async () => {
  await checkDatabaseStatus();

  const server = app.listen(config.port, () => {
    console.log(`🚀 EventSphere API running in [${config.nodeEnv}] mode on port ${config.port}`);
    console.log(`👉 Client URL allowed: ${config.clientOrigin}`);
    console.log(`👉 Health check: http://localhost:${config.port}/api/health`);
  });

  const shutdown = () => {
    console.log('\nGracefully shutting down EventSphere server...');
    server.close(() => {
      console.log('Server terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
