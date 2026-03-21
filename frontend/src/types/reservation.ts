import type { Medication } from './medication';
import type { Profile } from './user';

export interface Reservation {
  id: string;
  user_id: string;
  medication_id: string;
  quantity: number;
  status: 'pending' | 'completed' | 'cancelled';
  cancelled_by?: 'user' | 'pharmacy' | null;
  created_at: string;
  expires_at: string;
  medications?: Medication;
  profiles?: Profile;
}

export interface ReservationCreate {
  medication_id: string;
  quantity: number;
}

export interface ReservationUpdate {
  quantity: number;
}
