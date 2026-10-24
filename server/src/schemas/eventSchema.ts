import { z } from 'zod';

export const createEventSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
    summary: z
      .string({ required_error: 'Summary is required' })
      .trim()
      .min(10, 'Summary must be at least 10 characters')
      .max(300, 'Summary cannot exceed 300 characters'),
    description: z
      .string({ required_error: 'Description is required' })
      .trim()
      .min(20, 'Description must be at least 20 characters'),
    imageUrl: z
      .string({ required_error: 'Image URL is required' })
      .trim()
      .url('Please provide a valid image URL'),
    category: z
      .string({ required_error: 'Category is required' })
      .trim()
      .min(2, 'Category must be at least 2 characters'),
    technologies: z
      .array(z.string().trim().min(1, 'Technology tag cannot be empty'))
      .min(1, 'Provide at least one technology or interest tag'),
    startDateTime: z
      .string({ required_error: 'Start date and time is required' })
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid start date format'),
    endDateTime: z
      .string({ required_error: 'End date and time is required' })
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid end date format'),
    timezone: z
      .string()
      .trim()
      .default('UTC'),
    format: z.enum(['ONLINE', 'IN_PERSON'], {
      required_error: 'Format must be ONLINE or IN_PERSON',
    }),
    venue: z.string().trim().optional().nullable(),
    onlineUrl: z.string().trim().url('Invalid online meeting URL').optional().nullable(),
    targetAudience: z
      .string({ required_error: 'Target audience is required' })
      .trim()
      .min(2, 'Target audience must be at least 2 characters'),
    registrationUrl: z
      .string({ required_error: 'Registration URL is required' })
      .trim()
      .url('Please provide a valid registration URL'),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT').optional(),
  })
  .refine(
    (data) => new Date(data.endDateTime) > new Date(data.startDateTime),
    {
      message: 'End date & time must be strictly after start date & time',
      path: ['endDateTime'],
    }
  )
  .refine(
    (data) => {
      if (data.format === 'IN_PERSON') {
        return !!data.venue && data.venue.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Venue is required for in-person events',
      path: ['venue'],
    }
  )
  .refine(
    (data) => {
      if (data.format === 'ONLINE') {
        return !!data.onlineUrl && data.onlineUrl.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Online meeting URL is required for online events',
      path: ['onlineUrl'],
    }
  );

export const updateEventSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
    summary: z.string().trim().min(10).max(300).optional(),
    description: z.string().trim().min(20).optional(),
    imageUrl: z.string().trim().url('Please provide a valid image URL').optional(),
    category: z.string().trim().min(2).optional(),
    technologies: z
      .array(z.string().trim().min(1))
      .min(1, 'Provide at least one technology tag')
      .optional(),
    startDateTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid start date format')
      .optional(),
    endDateTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid end date format')
      .optional(),
    timezone: z.string().trim().optional(),
    format: z.enum(['ONLINE', 'IN_PERSON']).optional(),
    venue: z.string().trim().optional().nullable(),
    onlineUrl: z.string().trim().url('Invalid online meeting URL').optional().nullable(),
    targetAudience: z.string().trim().min(2).optional(),
    registrationUrl: z.string().trim().url('Please provide a valid registration URL').optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  })
  .refine(
    (data) => {
      if (data.startDateTime && data.endDateTime) {
        return new Date(data.endDateTime) > new Date(data.startDateTime);
      }
      return true;
    },
    {
      message: 'End date & time must be strictly after start date & time',
      path: ['endDateTime'],
    }
  );

export const eventQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  format: z.enum(['ONLINE', 'IN_PERSON']).optional(),
  audience: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['startDateTime', 'createdAt', 'title']).default('startDateTime').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(12).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED'], {
    required_error: 'Status must be either DRAFT or PUBLISHED',
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
