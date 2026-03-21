// src/routes/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { CreateMedication } from '@/pages/CreateMedication';
import { EditMedication } from '@/pages/EditMedication';
import { CreateUser } from '@/pages/CreateUser';
import { MyReservations } from '@/pages/MyReservations';
import { AdminReservations } from '@/pages/AdminReservations';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'login', Component: Login },
      { path: 'cadastro', Component: Signup },
      { path: 'esqueci-senha', Component: ForgotPassword },
      { path: 'redefinir-senha', Component: ResetPassword },
      { 
        path: 'cadastrar',
        element: (
          <ProtectedRoute requireAdmin>
            <CreateMedication />
          </ProtectedRoute>
        )
      },
      { 
        path: 'editar/:id',
        element: (
          <ProtectedRoute requireAdmin>
            <EditMedication />
          </ProtectedRoute>
        )
      },
      { 
        path: 'usuarios/criar', 
        element: (
          <ProtectedRoute requireAdmin>
            <CreateUser />
          </ProtectedRoute>
        )
      },
      { 
        path: 'minhas-reservas', 
        element: (
          <ProtectedRoute>
            <MyReservations />
          </ProtectedRoute>
        )
      },
      { 
        path: 'reservas', 
        element: (
          <ProtectedRoute requireAdmin>
            <AdminReservations />
          </ProtectedRoute>
        )
      },
    ],
  },
]);