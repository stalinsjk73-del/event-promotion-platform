import { apiRequest } from './client';
import { User, ApiResponse } from '../types';

export const authApi = {
  async register(data: { name: string; email: string; password: string; role?: 'ADMIN' | 'ORGANIZER' }): Promise<{ user: User; token: string }> {
    const res = await apiRequest<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data!;
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await apiRequest<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data!;
  },

  async logout(): Promise<void> {
    await apiRequest<ApiResponse<void>>('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<User> {
    const res = await apiRequest<ApiResponse<{ user: User }>>('/auth/me', {
      method: 'GET',
    });
    return res.data!.user;
  },
};
