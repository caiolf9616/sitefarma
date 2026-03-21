import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export function useAuthentication() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthentication must be used within an AuthProvider');
  }
  return context;
}

// Alias for convenience
export const useAuth = useAuthentication;