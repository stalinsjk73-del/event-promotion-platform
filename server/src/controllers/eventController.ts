import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/eventService';

export const eventController = {
  async getPublished(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.getPublishedEvents(req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.slug as string;
      const event = await eventService.getEventBySlug(slug, req.user);
      res.status(200).json({
        success: true,
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const event = await eventService.getEventById(id);
      res.status(200).json({
        success: true,
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const event = await eventService.createEvent(req.body, req.user);
      res.status(201).json({
        success: true,
        message: 'Event created successfully.',
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const id = req.params.id as string;
      const event = await eventService.updateEvent(id, req.body, req.user);
      res.status(200).json({
        success: true,
        message: 'Event updated successfully.',
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const id = req.params.id as string;
      const event = await eventService.updateStatus(id, req.body, req.user);
      res.status(200).json({
        success: true,
        message: `Event status updated to ${event.status}.`,
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const id = req.params.id as string;
      await eventService.deleteEvent(id, req.user);
      res.status(200).json({
        success: true,
        message: 'Event deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const result = await eventService.getOrganizerEvents(req.user, req.query as any);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await eventService.getCategories();
      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  },
};
