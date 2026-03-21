import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Medication } from '@/types/medication';
import { MedicationContext } from './MedicationContext';
import { medicationService } from '@/services';
import { toast } from 'sonner';

export function MedicationProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedications = useCallback(async () => {
    try {
      const data = await medicationService.getAll();
      setMedications(data);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
      toast.error('Erro ao carregar medicamentos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    await medicationService.create(medication);
    await fetchMedications();
  };

  const updateMedication = async (id: string, medication: Omit<Medication, 'id'>) => {
    await medicationService.update(id, medication);
    await fetchMedications();
  };

  const deleteMedication = async (id: string) => {
    await medicationService.delete(id);
    await fetchMedications();
  };

  const getMedicationById = (id: string) => {
    return medications.find(med => med.id === id);
  };

  return (
    <MedicationContext.Provider value={{
      medications,
      loading,
      addMedication,
      updateMedication,
      deleteMedication,
      getMedicationById,
    }}>
      {children}
    </MedicationContext.Provider>
  );
}