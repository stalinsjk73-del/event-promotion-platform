import { Router } from 'express';
import authRoutes from './authRoutes';
import eventRoutes from './eventRoutes';
import { checkDatabaseStatus } from '../utils/db';

const router = Router();

router.get('/health', async (_req, res) => {
  const isPostgresReady = await checkDatabaseStatus();
  res.status(200).json({
    status: 'healthy',
    platform: 'EventSphere API',
    database: isPostgresReady ? 'PostgreSQL' : 'In-Memory (Offline/Test Mode)',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);

export default router;
