import { Router } from 'express';
import { eventController } from '../controllers/eventController';
import { authenticate, optionalAuth, requireRole } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
  updateStatusSchema,
} from '../schemas/eventSchema';

const router = Router();

// Public routes
router.get('/', validate(eventQuerySchema, 'query'), eventController.getPublished);
router.get('/categories', eventController.getCategories);
router.get('/slug/:slug', optionalAuth, eventController.getBySlug);

// Organizer / Admin routes
router.get(
  '/manage/my-events',
  authenticate,
  requireRole('ADMIN', 'ORGANIZER'),
  validate(eventQuerySchema, 'query'),
  eventController.getMyEvents
);

router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'ORGANIZER'),
  validate(createEventSchema, 'body'),
  eventController.create
);

router.get('/:id', optionalAuth, eventController.getById);

router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'ORGANIZER'),
  validate(updateEventSchema, 'body'),
  eventController.update
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole('ADMIN', 'ORGANIZER'),
  validate(updateStatusSchema, 'body'),
  eventController.updateStatus
);

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'ORGANIZER'),
  eventController.delete
);

export default router;
