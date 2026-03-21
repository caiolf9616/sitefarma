import { useState } from 'react';
import { useMedications } from '@/hooks/useMedication';
import { useAuth } from '@/hooks/useAuthentication';
import { reservationService } from '@/services';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, Edit, CheckCircle, XCircle, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function Home() {
  const { medications } = useMedications();
  const { isAuthenticated, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQuantity = (id: string) => quantities[id] || 1;
  const setQuantity = (id: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.laboratory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReserve = async (medicationId: string) => {
    setReservingId(medicationId);
    try {
      await reservationService.create({ medication_id: medicationId, quantity: getQuantity(medicationId) });
      toast.success('Medicamento reservado com sucesso! Retire hoje na farmácia.');
      setQuantities(prev => ({ ...prev, [medicationId]: 1 }));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao reservar medicamento');
    } finally {
      setReservingId(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Consulta de Disponibilidade de Medicamentos
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Encontre rapidamente a disponibilidade de medicamentos em nossa farmácia
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nome do medicamento ou laboratório..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredMedications.length} medicamento(s) encontrado(s)
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredMedications.map((medication) => (
          <Card key={medication.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{medication.name}</CardTitle>
                  <CardDescription>{medication.laboratory}</CardDescription>
                </div>
                {medication.available ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <CheckCircle className="size-3 mr-1" />
                    Disponível
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    <XCircle className="size-3 mr-1" />
                    Indisponível
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dosagem:</span>
                  <span className="font-medium">{medication.dosage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantidade:</span>
                  <span className="font-medium">{medication.quantity} unidades</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Preço:</span>
                  {medication.is_free ? (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Gratuito
                    </Badge>
                  ) : (
                    <span className="font-medium text-emerald-600">
                      R$ {medication.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-xs mt-3 pt-3 border-t">
                  {medication.description}
                </p>
                
                <div className="mt-4 space-y-2">
                  {/* Botão de reserva para usuários comuns */}
                  {isAuthenticated && !isAdmin && medication.available && medication.quantity > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => setQuantity(medication.id, Math.max(1, getQuantity(medication.id) - 1))}
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{getQuantity(medication.id)}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => setQuantity(medication.id, Math.min(Math.min(medication.quantity, 5), getQuantity(medication.id) + 1))}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleReserve(medication.id)}
                        disabled={reservingId === medication.id}
                      >
                        <ShoppingCart className="size-4 mr-2" />
                        {reservingId === medication.id ? 'Reservando...' : 'Reservar'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Botão de edição para admins */}
                  {isAuthenticated && isAdmin && (
                    <Link to={`/editar/${medication.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="size-4 mr-2" />
                        Editar
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhum medicamento encontrado com o termo "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
}
