import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { AuthProvider } from '@/contexts/AuthProvider';
import { MedicationProvider } from '@/contexts/MedicamentationProvider';
import { Toaster } from 'sonner';

export function Layout() {
  return (
    <AuthProvider>
      <MedicationProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="w-full">
            <Outlet />
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </MedicationProvider>
    </AuthProvider>
  );
}