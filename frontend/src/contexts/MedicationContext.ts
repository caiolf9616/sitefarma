import { createContext } from 'react';
import type { MedicationContextType } from '@/types/medication';

export const MedicationContext = createContext<MedicationContextType | undefined>(undefined);