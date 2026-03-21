import { api } from '@/lib/axios';
import type { SignupData, Profile, User } from '@/types/user';

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  // Signup
  signup: async (data: SignupData): Promise<{ id: string; message: string }> => {
    const response = await api.post('/users/signup', data);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<Profile> => {
    const response = await api.get<Profile>('/users/me');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<Profile> => {
    const response = await api.get<Profile>(`/users/${id}`);
    return response.data;
  },

  // List all users (admin only)
  listUsers: async (): Promise<Profile[]> => {
    const response = await api.get<Profile[]>('/users/');
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Send password reset email
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  },

  // Reset password with recovery token
  resetPassword: async (access_token: string, new_password: string): Promise<{ message: string }> => {
    const response = await api.post('/users/reset-password', { access_token, new_password });
    return response.data;
  },
};
