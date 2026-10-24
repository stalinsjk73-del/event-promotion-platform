export type Role = 'ADMIN' | 'ORGANIZER';
export type Format = 'ONLINE' | 'IN_PERSON';
export type Status = 'DRAFT' | 'PUBLISHED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  imageUrl: string;
  category: string;
  technologies: string[];
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  venue: string | null;
  onlineUrl: string | null;
  format: Format;
  targetAudience: string;
  registrationUrl: string;
  status: Status;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventQuery {
  search?: string;
  category?: string;
  format?: Format;
  audience?: string;
  status?: Status;
  startDate?: string;
  endDate?: string;
  sortBy?: 'startDateTime' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Pagination;
  errors?: { field: string; message: string }[];
}
