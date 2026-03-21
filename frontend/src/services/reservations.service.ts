import { api } from '@/lib/axios';
import type { Reservation, ReservationCreate, ReservationUpdate } from '@/types/reservation';

export const reservationService = {
  create: async (data: ReservationCreate): Promise<Reservation> => {
    const response = await api.post<Reservation>('/reservations/', data);
    return response.data;
  },

  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>('/reservations/my');
    return response.data;
  },

  getAll: async (): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>('/reservations/');
    return response.data;
  },

  update: async (id: string, data: ReservationUpdate): Promise<Reservation> => {
    const response = await api.put<Reservation>(`/reservations/${id}`, data);
    return response.data;
  },

  deleteReservation: async (id: string): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },

  cancel: async (id: string): Promise<void> => {
    await api.patch(`/reservations/${id}/cancel`);
  },

  adminCancel: async (id: string): Promise<void> => {
    await api.patch(`/reservations/${id}/admin-cancel`);
  },

  complete: async (id: string): Promise<void> => {
    await api.patch(`/reservations/${id}/complete`);
  },
};
