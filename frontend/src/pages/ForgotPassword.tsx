import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Email enviado! Verifique sua caixa de entrada.');
    } catch {
      toast.error('Erro ao enviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-3 sm:px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">Esqueceu sua senha?</CardTitle>
            <CardDescription>
              Informe seu email e enviaremos as instruções para redefinir sua senha.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-700">
                Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link de redefinição em breve.
              </p>
              <p className="text-xs text-gray-500">
                Não recebeu? Verifique a pasta de spam ou tente novamente.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Tentar novamente
              </Button>
              <div className="text-center text-sm text-gray-600">
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Voltar ao login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar instruções'}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
