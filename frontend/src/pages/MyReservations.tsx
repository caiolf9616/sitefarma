import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuthentication';
import { reservationService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Clock, XCircle, CheckCircle, Package, Minus, Plus, Save, Trash2, AlertTriangle } from 'lucide-react';
import type { Reservation } from '@/types/reservation';

export function MyReservations() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      loadReservations();
    }
  }, [user, authLoading, navigate]);

  const loadReservations = async () => {
    try {
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch {
      toast.error('Erro ao carregar reservas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await reservationService.deleteReservation(id);
      toast.success('Reserva excluída com sucesso');
      loadReservations();
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Erro ao excluir reserva');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (reservation: Reservation) => {
    setEditingId(reservation.id);
    setEditQuantity(reservation.quantity);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity(1);
  };

  const handleSaveQuantity = async (id: string) => {
    setSavingId(id);
    try {
      await reservationService.update(id, { quantity: editQuantity });
      toast.success('Quantidade atualizada');
      setEditingId(null);
      loadReservations();
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Erro ao atualizar quantidade');
    } finally {
      setSavingId(null);
    }
  };

  const getStatusBadge = (reservation: Reservation) => {
    switch (reservation.status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="size-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-100 text-emerald-700">
            <CheckCircle className="size-3 mr-1" />
            Retirado
          </Badge>
        );
      case 'cancelled':
        if (reservation.cancelled_by === 'pharmacy') {
          return (
            <Badge className="bg-orange-100 text-orange-700">
              <AlertTriangle className="size-3 mr-1" />
              Cancelado pela farmácia
            </Badge>
          );
        }
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="size-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="mb-4 sm:mb-6"
      >
        <ArrowLeft className="size-4 mr-2" />
        Voltar
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Minhas Reservas</h1>
        <p className="text-gray-600">
          Reservas realizadas para retirada hoje
        </p>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="size-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Nenhuma reserva encontrada</p>
            <p className="text-gray-400 text-sm mb-6">
              Você ainda não fez nenhuma reserva hoje
            </p>
            <Button onClick={() => navigate('/')}>
              Ver Medicamentos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {reservation.medications?.name || 'Medicamento'}
                    </CardTitle>
                    <CardDescription>
                      {reservation.medications?.laboratory || ''}
                    </CardDescription>
                  </div>
                  {getStatusBadge(reservation)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Dosagem:</span>
                      <span className="ml-2 font-medium">
                        {reservation.medications?.dosage || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Preço:</span>
                      <span className="ml-2 font-medium text-emerald-600">
                        R$ {reservation.medications?.price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantidade:</span>
                      {editingId === reservation.id ? (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-6"
                            onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{editQuantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-6"
                            onClick={() => setEditQuantity(Math.min(5, editQuantity + 1))}
                          >
                            <Plus className="size-3" />
                          </Button>
                          <Button
                            variant="default"
                            size="icon"
                            className="size-6 ml-1"
                            onClick={() => handleSaveQuantity(reservation.id)}
                            disabled={savingId === reservation.id}
                          >
                            <Save className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={handleCancelEdit}
                          >
                            <XCircle className="size-3" />
                          </Button>
                        </span>
                      ) : (
                        <span className="ml-2 font-medium">
                          {reservation.quantity}
                          {reservation.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-6 px-2 text-xs"
                              onClick={() => handleStartEdit(reservation)}
                            >
                              Editar
                            </Button>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="text-sm text-gray-500">
                      <Clock className="size-4 inline mr-1" />
                      Reservado às {formatTime(reservation.created_at)}
                      {reservation.status === 'pending' && (
                        <span className="ml-2">
                          • Expira às {formatTime(reservation.expires_at)}
                        </span>
                      )}
                    </div>
                    
                    {reservation.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(reservation.id)}
                        disabled={deletingId === reservation.id}
                      >
                        <Trash2 className="size-4 mr-1" />
                        {deletingId === reservation.id ? 'Excluindo...' : 'Excluir'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
