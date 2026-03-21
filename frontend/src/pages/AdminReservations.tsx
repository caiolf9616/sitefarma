import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuthentication';
import { reservationService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Clock, XCircle, CheckCircle, Package, User, AlertTriangle } from 'lucide-react';
import type { Reservation } from '@/types/reservation';

export function AdminReservations() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      return;
    }

    if (isAdmin) {
      loadReservations();
    }
  }, [isAdmin, authLoading, navigate]);

  const loadReservations = async () => {
    try {
      const data = await reservationService.getAll();
      setReservations(data);
    } catch {
      toast.error('Erro ao carregar reservas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    setProcessingId(id);
    try {
      await reservationService.complete(id);
      toast.success('Reserva marcada como retirada');
      loadReservations();
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Erro ao completar reserva');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAdminCancel = async (id: string) => {
    setProcessingId(id);
    try {
      await reservationService.adminCancel(id);
      toast.success('Reserva cancelada pela farmácia');
      loadReservations();
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Erro ao cancelar reserva');
    } finally {
      setProcessingId(null);
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
            Cancelado pelo usuário
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

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const otherReservations = reservations.filter(r => r.status !== 'pending');

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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Package className="size-6" />
            Gerenciar Reservas
          </CardTitle>
          <CardDescription>
            Visualize e gerencie todas as reservas do dia
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Reservas Pendentes */}
      {pendingReservations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-yellow-700">
            Reservas Pendentes ({pendingReservations.length})
          </h3>
          <div className="space-y-4">
            {pendingReservations.map((reservation) => (
              <Card key={reservation.id} className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span className="font-medium">
                          {reservation.profiles?.name || 'Usuário'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({reservation.profiles?.email})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="size-4 text-muted-foreground" />
                        <span>{reservation.medications?.name || 'Medicamento'}</span>
                        <span className="text-sm text-muted-foreground">
                          • Qtd: {reservation.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(reservation)}
                        <span className="text-sm text-muted-foreground">
                          Reservado às {formatTime(reservation.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdminCancel(reservation.id)}
                        disabled={processingId === reservation.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="size-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleComplete(reservation.id)}
                        disabled={processingId === reservation.id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="size-4 mr-1" />
                        Marcar Retirada
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Outras Reservas (Completadas/Canceladas) */}
      {otherReservations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
            Histórico de Hoje ({otherReservations.length})
          </h3>
          <div className="space-y-3">
            {otherReservations.map((reservation) => (
              <Card key={reservation.id} className="opacity-75">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {reservation.profiles?.name || 'Usuário'}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm">
                          {reservation.medications?.name || 'Medicamento'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • Qtd: {reservation.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {formatTime(reservation.created_at)}
                      </div>
                    </div>
                    {getStatusBadge(reservation)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {reservations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma reserva para hoje</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
