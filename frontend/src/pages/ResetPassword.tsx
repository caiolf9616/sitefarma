import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase envia o token via hash na URL: #access_token=...&type=recovery
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    const type = params.get('type');

    if (token && type === 'recovery') {
      setAccessToken(token);
    } else {
      setTokenError(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!accessToken) {
      toast.error('Token inválido ou expirado');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(accessToken, newPassword);
      toast.success('Senha redefinida com sucesso!');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const msg = error?.response?.data?.detail ?? 'Erro ao redefinir senha. O link pode ter expirado.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-3 sm:px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <Logo size="md" />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl">Link inválido</CardTitle>
              <CardDescription>
                Este link de redefinição de senha é inválido ou expirou.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/esqueci-senha">
              <Button className="w-full">Solicitar novo link</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="w-full">Voltar ao login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-3 sm:px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">Redefinir senha</CardTitle>
            <CardDescription>
              Digite sua nova senha abaixo.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </Button>

            <div className="text-center text-sm text-gray-600 mt-4">
              <Link to="/login" className="text-primary hover:underline font-medium">
                Voltar ao login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
