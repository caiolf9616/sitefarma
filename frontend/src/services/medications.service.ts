import { api } from '@/lib/axios';
import type { Medication } from '@/types/medication';

export const medicationService = {
  // List all medications
  getAll: async (): Promise<Medication[]> => {
    const response = await api.get<Medication[]>('/medications/');
    return response.data;
  },

  // Get a medication by ID
  getById: async (id: string): Promise<Medication> => {
    const response = await api.get<Medication>(`/medications/${id}`);
    return response.data;
  },

  // Search medication by name
  getByName: async (name: string): Promise<Medication> => {
    const response = await api.get<Medication>(`/medications/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Create new medication
  create: async (medication: Omit<Medication, 'id'>): Promise<Medication> => {
    const response = await api.post<Medication>('/medications/', medication);
    return response.data;
  },

  // Update medication
  update: async (id: string, medication: Omit<Medication, 'id'>): Promise<Medication> => {
    const response = await api.put<Medication>(`/medications/${id}`, medication);
    return response.data;
  },

  // Delete medication
  delete: async (id: string): Promise<void> => {
    await api.delete(`/medications/${id}`);
  },
};
