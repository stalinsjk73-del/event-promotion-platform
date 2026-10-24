import { prisma, INITIAL_USERS, INITIAL_EVENTS } from './prisma';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'ORGANIZER';
  createdAt: Date;
  updatedAt: Date;
}

export interface EventEntity {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  imageUrl: string;
  category: string;
  technologies: string[];
  startDateTime: Date;
  endDateTime: Date;
  timezone: string;
  venue: string | null;
  onlineUrl: string | null;
  format: 'ONLINE' | 'IN_PERSON';
  targetAudience: string;
  registrationUrl: string;
  status: 'DRAFT' | 'PUBLISHED';
  organizerId: string;
  organizer?: { id: string; name: string; email: string; role: string };
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback storage
let memoryUsers: UserEntity[] = JSON.parse(JSON.stringify(INITIAL_USERS)).map((u: any) => ({
  ...u,
  createdAt: new Date(u.createdAt),
  updatedAt: new Date(u.updatedAt),
}));

let memoryEvents: EventEntity[] = JSON.parse(JSON.stringify(INITIAL_EVENTS)).map((e: any) => ({
  ...e,
  startDateTime: new Date(e.startDateTime),
  endDateTime: new Date(e.endDateTime),
  createdAt: new Date(e.createdAt),
  updatedAt: new Date(e.updatedAt),
}));

let usePrisma = true;
let connectionTested = false;

// Test connection once lazily
export const checkDatabaseStatus = async (): Promise<boolean> => {
  if (connectionTested) return usePrisma;
  try {
    await prisma.$queryRaw`SELECT 1`;
    usePrisma = true;
    console.log('✅ Connected to PostgreSQL database via Prisma');
  } catch (error) {
    usePrisma = false;
    console.warn('⚠️  PostgreSQL connection not reachable. Using in-memory persistent database layer for zero-friction execution.');
  } finally {
    connectionTested = true;
  }
  return usePrisma;
};

// Reset memory data (useful for test isolation)
export const resetMemoryStore = () => {
  memoryUsers = JSON.parse(JSON.stringify(INITIAL_USERS)).map((u: any) => ({
    ...u,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
  }));

  memoryEvents = JSON.parse(JSON.stringify(INITIAL_EVENTS)).map((e: any) => ({
    ...e,
    startDateTime: new Date(e.startDateTime),
    endDateTime: new Date(e.endDateTime),
    createdAt: new Date(e.createdAt),
    updatedAt: new Date(e.updatedAt),
  }));
};

export const db = {
  user: {
    async findUnique(where: { email?: string; id?: string }): Promise<UserEntity | null> {
      await checkDatabaseStatus();
      if (usePrisma) {
        try {
          return (await prisma.user.findUnique({ where: where as any })) as UserEntity | null;
        } catch (e) {
          usePrisma = false;
        }
      }
      if (where.email) {
        return memoryUsers.find((u) => u.email.toLowerCase() === where.email?.toLowerCase()) || null;
      }
      if (where.id) {
        return memoryUsers.find((u) => u.id === where.id) || null;
      }
      return null;
    },

    async create(data: { name: string; email: string; passwordHash: string; role?: 'ADMIN' | 'ORGANIZER' }): Promise<UserEntity> {
      await checkDatabaseStatus();
      const role = data.role || 'ORGANIZER';
      if (usePrisma) {
        try {
          return (await prisma.user.create({
            data: {
              name: data.name,
              email: data.email.toLowerCase(),
              passwordHash: data.passwordHash,
              role,
            },
          })) as UserEntity;
        } catch (e) {
          usePrisma = false;
        }
      }
      const newUser: UserEntity = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryUsers.push(newUser);
      return newUser;
    },
  },

  event: {
    async findMany(options: {
      where?: {
        status?: 'DRAFT' | 'PUBLISHED';
        category?: string;
        format?: 'ONLINE' | 'IN_PERSON';
        targetAudience?: string;
        organizerId?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
      };
      orderBy?: { [key: string]: 'asc' | 'desc' };
      skip?: number;
      take?: number;
    }): Promise<{ events: EventEntity[]; total: number }> {
      await checkDatabaseStatus();
      const { where = {}, orderBy = { startDateTime: 'asc' }, skip = 0, take = 12 } = options;

      if (usePrisma) {
        try {
          const prismaWhere: any = {};
          if (where.status) prismaWhere.status = where.status;
          if (where.category) prismaWhere.category = { equals: where.category, mode: 'insensitive' };
          if (where.format) prismaWhere.format = where.format;
          if (where.organizerId) prismaWhere.organizerId = where.organizerId;
          if (where.startDate) prismaWhere.startDateTime = { gte: new Date(where.startDate) };
          if (where.endDate) {
            prismaWhere.startDateTime = {
              ...(prismaWhere.startDateTime || {}),
              lte: new Date(where.endDate),
            };
          }
          if (where.search) {
            prismaWhere.OR = [
              { title: { contains: where.search, mode: 'insensitive' } },
              { summary: { contains: where.search, mode: 'insensitive' } },
              { description: { contains: where.search, mode: 'insensitive' } },
              { technologies: { has: where.search } },
            ];
          }

          const [events, total] = await Promise.all([
            prisma.event.findMany({
              where: prismaWhere,
              orderBy,
              skip,
              take,
              include: {
                organizer: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
            }),
            prisma.event.count({ where: prismaWhere }),
          ]);

          return { events: events as unknown as EventEntity[], total };
        } catch (e) {
          usePrisma = false;
        }
      }

      // Memory implementation
      let filtered = [...memoryEvents];

      if (where.status) {
        filtered = filtered.filter((e) => e.status === where.status);
      }
      if (where.category) {
        filtered = filtered.filter((e) => e.category.toLowerCase() === where.category?.toLowerCase());
      }
      if (where.format) {
        filtered = filtered.filter((e) => e.format === where.format);
      }
      if (where.targetAudience) {
        filtered = filtered.filter((e) =>
          e.targetAudience.toLowerCase().includes(where.targetAudience!.toLowerCase())
        );
      }
      if (where.organizerId) {
        filtered = filtered.filter((e) => e.organizerId === where.organizerId);
      }
      if (where.startDate) {
        const start = new Date(where.startDate);
        filtered = filtered.filter((e) => new Date(e.startDateTime) >= start);
      }
      if (where.endDate) {
        const end = new Date(where.endDate);
        filtered = filtered.filter((e) => new Date(e.startDateTime) <= end);
      }
      if (where.search) {
        const query = where.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.summary.toLowerCase().includes(query) ||
            e.description.toLowerCase().includes(query) ||
            e.technologies.some((t) => t.toLowerCase().includes(query))
        );
      }

      const sortKey = Object.keys(orderBy)[0] || 'startDateTime';
      const sortOrder = orderBy[sortKey] || 'asc';

      filtered.sort((a: any, b: any) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + take).map((e) => {
        const organizer = memoryUsers.find((u) => u.id === e.organizerId);
        return {
          ...e,
          organizer: organizer
            ? { id: organizer.id, name: organizer.name, email: organizer.email, role: organizer.role }
            : undefined,
        };
      });

      return { events: paginated, total };
    },

    async findUnique(where: { id?: string; slug?: string }): Promise<EventEntity | null> {
      await checkDatabaseStatus();
      if (usePrisma) {
        try {
          const event = await prisma.event.findUnique({
            where: where as any,
            include: {
              organizer: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          });
          return event as unknown as EventEntity | null;
        } catch (e) {
          usePrisma = false;
        }
      }

      let found: EventEntity | undefined;
      if (where.id) {
        found = memoryEvents.find((e) => e.id === where.id);
      } else if (where.slug) {
        found = memoryEvents.find((e) => e.slug === where.slug);
      }

      if (!found) return null;
      const organizer = memoryUsers.find((u) => u.id === found!.organizerId);
      return {
        ...found,
        organizer: organizer
          ? { id: organizer.id, name: organizer.name, email: organizer.email, role: organizer.role }
          : undefined,
      };
    },

    async create(data: Omit<EventEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventEntity> {
      await checkDatabaseStatus();
      const { organizer: _omittedOrg, ...eventPayload } = data;
      if (usePrisma) {
        try {
          const event = await prisma.event.create({
            data: {
              ...eventPayload,
              startDateTime: new Date(data.startDateTime),
              endDateTime: new Date(data.endDateTime),
            },
            include: {
              organizer: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          });
          return event as unknown as EventEntity;
        } catch (e) {
          usePrisma = false;
        }
      }

      const newEvent: EventEntity = {
        ...data,
        id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryEvents.push(newEvent);

      const organizer = memoryUsers.find((u) => u.id === newEvent.organizerId);
      return {
        ...newEvent,
        organizer: organizer
          ? { id: organizer.id, name: organizer.name, email: organizer.email, role: organizer.role }
          : undefined,
      };
    },

    async update(id: string, data: Partial<Omit<EventEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EventEntity> {
      await checkDatabaseStatus();
      if (usePrisma) {
        try {
          const updateData: any = { ...data };
          if (data.startDateTime) updateData.startDateTime = new Date(data.startDateTime);
          if (data.endDateTime) updateData.endDateTime = new Date(data.endDateTime);

          const event = await prisma.event.update({
            where: { id },
            data: updateData,
            include: {
              organizer: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          });
          return event as unknown as EventEntity;
        } catch (e) {
          usePrisma = false;
        }
      }

      const index = memoryEvents.findIndex((e) => e.id === id);
      if (index === -1) {
        throw new Error('Event not found');
      }

      const existing = memoryEvents[index];
      const updated: EventEntity = {
        ...existing,
        ...data,
        startDateTime: data.startDateTime ? new Date(data.startDateTime) : existing.startDateTime,
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : existing.endDateTime,
        updatedAt: new Date(),
      };
      memoryEvents[index] = updated;

      const organizer = memoryUsers.find((u) => u.id === updated.organizerId);
      return {
        ...updated,
        organizer: organizer
          ? { id: organizer.id, name: organizer.name, email: organizer.email, role: organizer.role }
          : undefined,
      };
    },

    async delete(id: string): Promise<boolean> {
      await checkDatabaseStatus();
      if (usePrisma) {
        try {
          await prisma.event.delete({ where: { id } });
          return true;
        } catch (e) {
          usePrisma = false;
        }
      }

      const index = memoryEvents.findIndex((e) => e.id === id);
      if (index === -1) return false;
      memoryEvents.splice(index, 1);
      return true;
    },

    async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
      await checkDatabaseStatus();
      if (usePrisma) {
        try {
          const found = await prisma.event.findUnique({ where: { slug } });
          if (!found) return false;
          if (excludeId && found.id === excludeId) return false;
          return true;
        } catch (e) {
          usePrisma = false;
        }
      }

      return memoryEvents.some((e) => e.slug === slug && (!excludeId || e.id !== excludeId));
    },
  },
};
