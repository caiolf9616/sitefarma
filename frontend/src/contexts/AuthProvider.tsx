import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { authService } from '@/services';
import type { User } from '@/types/user';
import { toast } from 'sonner';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar token salvo ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          if (!profile || !profile.name || !profile.email) {
            localStorage.removeItem('access_token');
            setUser(null);
          } else {
            setUser(profile);
          }
        } catch {
          localStorage.removeItem('access_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { access_token, user } = await authService.login(email, password);
      localStorage.setItem('access_token', access_token);
      setUser(user);
      return true;
    } catch (error: any) {
      const detail = error.response?.data?.detail || 'E-mail ou senha inválidos';
      toast.error(detail);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const isAdmin = user?.perfil === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user, 
      isAdmin,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}