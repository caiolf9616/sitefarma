import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Search, Package, UserPlus, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthentication';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Logo } from './Logo';

export function AppSidebar() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Início',
      url: '/',
      icon: Home,
    },
    {
      title: 'Consultar Medicamentos',
      url: '/',
      icon: Search,
    },
  ];

  // Menu para usuários comuns (não-admin)
  const userMenuItems = [
    {
      title: 'Minhas Reservas',
      url: '/minhas-reservas',
      icon: Package,
    },
  ];

  // Menu para administradores
  const adminMenuItems = [
    {
      title: 'Cadastrar Medicamento',
      url: '/cadastrar',
      icon: Plus,
    },
    {
      title: 'Cadastrar Usuário',
      url: '/usuarios/criar',
      icon: UserPlus,
    },
    {
      title: 'Gerenciar Reservas',
      url: '/reservas',
      icon: ClipboardList,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link to="/">
          <Logo size="sm" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu para usuários comuns autenticados */}
        {isAuthenticated && !isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Minhas Atividades</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <Link to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Menu para administradores */}
        {isAuthenticated && isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <Link to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t text-xs text-gray-500">
        © 2026 SiteFarma
      </SidebarFooter>
    </Sidebar>
  )
}