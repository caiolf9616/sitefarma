export interface Medication {
  id: string;
  name: string;
  laboratory: string;
  dosage: string;
  quantity: number;
  price: number;
  description: string;
  available: boolean;
  is_free: boolean;
}

export interface MedicationContextType {
  medications: Medication[];
  loading: boolean;
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (id: string, medication: Omit<Medication, 'id'>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  getMedicationById: (id: string) => Medication | undefined;
}