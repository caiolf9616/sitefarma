import { MedicationContext } from "@/contexts/MedicationContext";
import { useContext } from "react";

export function useMedications() {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error('useMedications must be used within a MedicationProvider');
  }
  return context;
}