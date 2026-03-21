import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMedications } from '@/hooks/useMedication';
import { useAuthentication } from '@/hooks/useAuthentication';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export function CreateMedication() {
  const { addMedication } = useMedications();
  const { isAuthenticated } = useAuthentication();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    laboratory: '',
    dosage: '',
    quantity: 0,
    price: 0,
    description: '',
    available: true,
    is_free: false
  });

  // Redirecionar se não estiver autenticado
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMedication(formData);
      toast.success('Medicamento cadastrado com sucesso!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao cadastrar medicamento');
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="mb-4 sm:mb-6"
      >
        <ArrowLeft className="size-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Cadastrar Novo Medicamento</CardTitle>
          <CardDescription>
            Preencha as informações do medicamento para adicionar ao estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Medicamento *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Dipirona 500mg"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laboratory">Laboratório *</Label>
                <Input
                  id="laboratory"
                  placeholder="Ex: Medley"
                  value={formData.laboratory}
                  onChange={(e) => handleChange('laboratory', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosagem *</Label>
                <Input
                  id="dosage"
                  placeholder="Ex: 500mg"
                  value={formData.dosage}
                  onChange={(e) => handleChange('dosage', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do medicamento..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => handleChange('available', checked)}
              />
              <Label htmlFor="available" className="cursor-pointer">
                Medicamento disponível para venda
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_free"
                checked={formData.is_free}
                onCheckedChange={(checked) => handleChange('is_free', checked)}
              />
              <Label htmlFor="is_free" className="cursor-pointer">
                Medicamento gratuito
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Cadastrar Medicamento
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
