import { db, EventEntity } from '../utils/db';
import { generateUniqueSlug } from '../utils/slugify';
import {
  CreateEventInput,
  UpdateEventInput,
  EventQueryInput,
  UpdateStatusInput,
} from '../schemas/eventSchema';
import { AuthenticatedUser } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const eventService = {
  async getPublishedEvents(query: EventQueryInput): Promise<PaginatedResult<EventEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const { events, total } = await db.event.findMany({
      where: {
        status: 'PUBLISHED',
        category: query.category,
        format: query.format,
        targetAudience: query.audience,
        search: query.search,
        startDate: query.startDate,
        endDate: query.endDate,
      },
      orderBy: {
        [query.sortBy || 'startDateTime']: query.sortOrder || 'asc',
      },
      skip,
      take: limit,
    });

    return {
      data: events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getEventBySlug(slug: string, requestingUser?: AuthenticatedUser): Promise<EventEntity> {
    const event = await db.event.findUnique({ slug });

    if (!event) {
      throw new AppError('Event not found.', 404);
    }

    // Public users can only see published events
    if (event.status === 'DRAFT') {
      const isOwner = requestingUser && requestingUser.id === event.organizerId;
      const isAdmin = requestingUser && requestingUser.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        throw new AppError('Event not found or has not been published yet.', 404);
      }
    }

    return event;
  },

  async getEventById(id: string): Promise<EventEntity> {
    const event = await db.event.findUnique({ id });
    if (!event) {
      throw new AppError('Event not found.', 404);
    }
    return event;
  },

  async createEvent(input: CreateEventInput, user: AuthenticatedUser): Promise<EventEntity> {
    // Generate unique slug
    const slug = await generateUniqueSlug(
      input.title,
      (candidate) => db.event.isSlugTaken(candidate),
      input.slug
    );

    const event = await db.event.create({
      title: input.title,
      slug,
      summary: input.summary,
      description: input.description,
      imageUrl: input.imageUrl,
      category: input.category,
      technologies: input.technologies,
      startDateTime: new Date(input.startDateTime),
      endDateTime: new Date(input.endDateTime),
      timezone: input.timezone || 'UTC',
      format: input.format,
      venue: input.format === 'IN_PERSON' ? input.venue || null : null,
      onlineUrl: input.format === 'ONLINE' ? input.onlineUrl || null : null,
      targetAudience: input.targetAudience,
      registrationUrl: input.registrationUrl,
      status: input.status || 'DRAFT',
      organizerId: user.id,
    });

    return event;
  },

  async updateEvent(
    id: string,
    input: UpdateEventInput,
    user: AuthenticatedUser
  ): Promise<EventEntity> {
    const existing = await db.event.findUnique({ id });
    if (!existing) {
      throw new AppError('Event not found.', 404);
    }

    // Authorization: Admin can edit any event; Organizer can edit only their own
    if (user.role !== 'ADMIN' && existing.organizerId !== user.id) {
      throw new AppError('Forbidden: You are only authorized to edit your own events.', 403);
    }

    // If slug is provided and changed, check uniqueness
    let newSlug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      const taken = await db.event.isSlugTaken(input.slug, id);
      if (taken) {
        throw new AppError('This event URL slug is already taken. Please choose another.', 409);
      }
      newSlug = input.slug;
    } else if (input.title && input.title !== existing.title && !input.slug) {
      // Auto-update slug if title changed and slug wasn't explicitly set
      newSlug = await generateUniqueSlug(
        input.title,
        (candidate) => db.event.isSlugTaken(candidate, id)
      );
    }

    // Format validation
    const nextFormat = input.format || existing.format;
    let nextVenue = input.venue !== undefined ? input.venue : existing.venue;
    let nextOnlineUrl = input.onlineUrl !== undefined ? input.onlineUrl : existing.onlineUrl;

    if (nextFormat === 'IN_PERSON') {
      if (!nextVenue) {
        throw new AppError('Venue is required for in-person events.', 400);
      }
      nextOnlineUrl = null;
    } else {
      if (!nextOnlineUrl) {
        throw new AppError('Online URL is required for online events.', 400);
      }
      nextVenue = null;
    }

    const updated = await db.event.update(id, {
      ...(input.title && { title: input.title }),
      slug: newSlug,
      ...(input.summary && { summary: input.summary }),
      ...(input.description && { description: input.description }),
      ...(input.imageUrl && { imageUrl: input.imageUrl }),
      ...(input.category && { category: input.category }),
      ...(input.technologies && { technologies: input.technologies }),
      ...(input.startDateTime && { startDateTime: new Date(input.startDateTime) }),
      ...(input.endDateTime && { endDateTime: new Date(input.endDateTime) }),
      ...(input.timezone && { timezone: input.timezone }),
      format: nextFormat,
      venue: nextVenue,
      onlineUrl: nextOnlineUrl,
      ...(input.targetAudience && { targetAudience: input.targetAudience }),
      ...(input.registrationUrl && { registrationUrl: input.registrationUrl }),
      ...(input.status && { status: input.status }),
    });

    return updated;
  },

  async updateStatus(
    id: string,
    statusInput: UpdateStatusInput,
    user: AuthenticatedUser
  ): Promise<EventEntity> {
    const existing = await db.event.findUnique({ id });
    if (!existing) {
      throw new AppError('Event not found.', 404);
    }

    if (user.role !== 'ADMIN' && existing.organizerId !== user.id) {
      throw new AppError('Forbidden: You can only change status of your own events.', 403);
    }

    const updated = await db.event.update(id, {
      status: statusInput.status,
    });

    return updated;
  },

  async deleteEvent(id: string, user: AuthenticatedUser): Promise<void> {
    const existing = await db.event.findUnique({ id });
    if (!existing) {
      throw new AppError('Event not found.', 404);
    }

    if (user.role !== 'ADMIN' && existing.organizerId !== user.id) {
      throw new AppError('Forbidden: You can only delete your own events.', 403);
    }

    await db.event.delete(id);
  },

  async getOrganizerEvents(
    user: AuthenticatedUser,
    query: EventQueryInput
  ): Promise<PaginatedResult<EventEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Organizers only see their own; Admins see all unless specified
    const organizerFilter = user.role === 'ADMIN' ? undefined : user.id;

    const { events, total } = await db.event.findMany({
      where: {
        organizerId: organizerFilter,
        status: query.status,
        category: query.category,
        format: query.format,
        search: query.search,
      },
      orderBy: {
        [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
      },
      skip,
      take: limit,
    });

    return {
      data: events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getCategories(): Promise<string[]> {
    const { events } = await db.event.findMany({
      where: { status: 'PUBLISHED' },
      take: 100,
    });
    const categories = Array.from(new Set(events.map((e) => e.category))).filter(Boolean);
    return categories.length > 0
      ? categories
      : [
          'Artificial Intelligence',
          'Cloud & DevOps',
          'Web Development',
          'Cybersecurity',
          'Mobile',
          'Data Science',
        ];
  },
};
