import { apiRequest } from './client';
import { EventItem, EventQuery, ApiResponse, Pagination } from '../types';

export const eventApi = {
  async getEvents(query: EventQuery = {}): Promise<{ events: EventItem[]; pagination: Pagination }> {
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.category) params.append('category', query.category);
    if (query.format) params.append('format', query.format);
    if (query.audience) params.append('audience', query.audience);
    if (query.status) params.append('status', query.status);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const qs = params.toString();
    const endpoint = `/events${qs ? `?${qs}` : ''}`;
    const res = await apiRequest<ApiResponse<EventItem[]>>(endpoint);

    return {
      events: res.data || [],
      pagination: res.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 },
    };
  },

  async getEventBySlug(slug: string): Promise<EventItem> {
    const res = await apiRequest<ApiResponse<{ event: EventItem }>>(`/events/slug/${slug}`);
    return res.data!.event;
  },

  async getEventById(id: string): Promise<EventItem> {
    const res = await apiRequest<ApiResponse<{ event: EventItem }>>(`/events/${id}`);
    return res.data!.event;
  },

  async getCategories(): Promise<string[]> {
    const res = await apiRequest<ApiResponse<{ categories: string[] }>>('/events/categories');
    return res.data?.categories || [];
  },

  async getMyEvents(query: EventQuery = {}): Promise<{ events: EventItem[]; pagination: Pagination }> {
    const params = new URLSearchParams();
    if (query.search) params.append('search', query.search);
    if (query.category) params.append('category', query.category);
    if (query.status) params.append('status', query.status);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const qs = params.toString();
    const endpoint = `/events/manage/my-events${qs ? `?${qs}` : ''}`;
    const res = await apiRequest<ApiResponse<EventItem[]>>(endpoint);

    return {
      events: res.data || [],
      pagination: res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 },
    };
  },

  async createEvent(data: any): Promise<EventItem> {
    const res = await apiRequest<ApiResponse<{ event: EventItem }>>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data!.event;
  },

  async updateEvent(id: string, data: any): Promise<EventItem> {
    const res = await apiRequest<ApiResponse<{ event: EventItem }>>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data!.event;
  },

  async updateStatus(id: string, status: 'DRAFT' | 'PUBLISHED'): Promise<EventItem> {
    const res = await apiRequest<ApiResponse<{ event: EventItem }>>(`/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data!.event;
  },

  async deleteEvent(id: string): Promise<void> {
    await apiRequest<ApiResponse<void>>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};
