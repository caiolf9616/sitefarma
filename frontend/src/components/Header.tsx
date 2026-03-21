import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuthentication } from '@/hooks/useAuthentication';
import { Button } from './ui/button';
import { LogOut, User, Plus, Search, Menu, Package, ClipboardList } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

export function Header() {
  const { user, logout, isAuthenticated, isAdmin } = useAuthentication();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavigate = () => {
    setIsOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      {/* Desktop Header */}
      <div className="hidden md:block w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0">
            <Logo size="sm" />
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Search className="size-4 mr-2" />
                Consultar
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <Link to="/cadastrar">
                      <Button variant="ghost" size="sm">
                        <Plus className="size-4 mr-2" />
                        Cadastrar
                      </Button>
                    </Link>
                    <Link to="/reservas">
                      <Button variant="ghost" size="sm">
                        <ClipboardList className="size-4 mr-2" />
                        Reservas
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link to="/minhas-reservas">
                    <Button variant="ghost" size="sm">
                      <Package className="size-4 mr-2" />
                      Reservas
                    </Button>
                  </Link>
                )}
                
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="size-4" />
                    <span>{user?.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="size-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">
                  <User className="size-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center h-14 px-2">
        {/* Menu à esquerda */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-2">
              <Link to="/" onClick={handleNavigate}>
                <Button variant="ghost" className="w-full justify-start">
                  <Search className="size-4 mr-2" />
                  Consultar
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <>
                      <Link to="/cadastrar" onClick={handleNavigate}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Plus className="size-4 mr-2" />
                          Cadastrar
                        </Button>
                      </Link>
                      <Link to="/reservas" onClick={handleNavigate}>
                        <Button variant="ghost" className="w-full justify-start">
                          <ClipboardList className="size-4 mr-2" />
                          Reservas
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/minhas-reservas" onClick={handleNavigate}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Package className="size-4 mr-2" />
                        Reservas
                      </Button>
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 px-4 py-2">
                      <User className="size-4" />
                      <span>{user?.name}</span>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
                      <LogOut className="size-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </>
              ) : (
                <Link to="/login" onClick={handleNavigate}>
                  <Button variant="default" className="w-full justify-start mt-2">
                    <User className="size-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo centralizada */}
        <div className="flex-1 flex justify-center">
          <Link to="/">
            <Logo size="sm" />
          </Link>
        </div>

        {/* Espaço vazio para balancear */}
        <div className="w-10 shrink-0" />
      </div>
    </header>
  );
}
